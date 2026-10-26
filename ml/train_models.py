import pathlib
import json
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
import joblib

# Paths
DATA_PATH = pathlib.Path(r'd:\\projects\\inventory\\crams_dataset_1000.csv')
MODEL_PATH = pathlib.Path(r'd:\\projects\\inventory\\ml\\hybrid_model.joblib')
EVAL_PATH = pathlib.Path(r'd:\\projects\\inventory\\ml\\evaluation_results.json')
REPORT_PATH = pathlib.Path(r'd:\\projects\\inventory\\ml\\model_comparison_report.md')

# Load dataset
df = pd.read_csv(DATA_PATH)


# Separate features and target
target_col = "risk_level"

# Remove metadata and fields that could leak the target.
# Keep only actual organizational indicators as model inputs.
exclude_cols = [
    "record_id",
    "company_id",
    "period_month",
    "label_method",
    "data_origin",
    "overall_rule_score_0_100",
]

missing_target = df[target_col].isna().sum()
if missing_target:
    raise ValueError(f"Target column contains {missing_target} missing values.")

X = df.drop(columns=[target_col] + [
    col for col in exclude_cols if col in df.columns
])
y = df[target_col]

# Confirm all model inputs are numeric
non_numeric = X.select_dtypes(exclude="number").columns.tolist()
if non_numeric:
    raise ValueError(
        f"Non-numeric feature columns remain: {non_numeric}. "
        "Encode or remove them before training."
    )

print("Dataset rows:", len(df))
print("Features used:", X.columns.tolist())
print("Target distribution:")
print(y.value_counts())

# Identify numeric columns (assuming all are numeric for this dataset)
numeric_features = X.columns.tolist()
numeric_transformer = Pipeline(steps=[
    ("imputer", SimpleImputer(strategy='median')),
    ("scaler", StandardScaler())
])

preprocess = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features)
    ]
)

# Define individual models
rf = RandomForestClassifier(n_estimators=200, random_state=42)
svm = SVC(probability=True, kernel='rbf', C=1.0, random_state=42)
adaboost = AdaBoostClassifier(n_estimators=200, random_state=42)

# Pipelines for each model
rf_pipe = Pipeline(steps=[('preprocess', preprocess), ('clf', rf)])
svm_pipe = Pipeline(steps=[('preprocess', preprocess), ('clf', svm)])
adaboost_pipe = Pipeline(steps=[('preprocess', preprocess), ('clf', adaboost)])

# Train‑test split (stratified)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

# Fit individual models
rf_pipe.fit(X_train, y_train)
svm_pipe.fit(X_train, y_train)
adaboost_pipe.fit(X_train, y_train)

# Soft‑voting ensemble
voting_clf = VotingClassifier(
    estimators=[
        ('rf', rf_pipe),
        ('svm', svm_pipe),
        ('ada', adaboost_pipe)
    ],
    voting='soft'
)

# Fit ensemble on the same training data
voting_clf.fit(X_train, y_train)

# Evaluation helper
def evaluate(model, X_test, y_test):
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average='macro')
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()
    return {
        "accuracy": acc,
        "macro_f1": f1_macro,
        "per_class": report,
        "confusion_matrix": cm
    }

# Gather results
results = {
    "random_forest": evaluate(rf_pipe, X_test, y_test),
    "svm": evaluate(svm_pipe, X_test, y_test),
    "adaboost": evaluate(adaboost_pipe, X_test, y_test),
    "voting_ensemble": evaluate(voting_clf, X_test, y_test)
}

# Save model and results
MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

# Save the best individual model: SVM
joblib.dump(svm_pipe, MODEL_PATH.parent / "svm_model.joblib")

# Save the hybrid ensemble
joblib.dump(voting_clf, MODEL_PATH)

# Save evaluation results
EVAL_PATH.write_text(
    json.dumps(results, indent=2),
    encoding="utf-8"
)

# Generate a concise markdown report
with REPORT_PATH.open('w', encoding='utf-8') as f:
    f.write("# Model Comparison Report\n\n")
    f.write(f"**Dataset:** {DATA_PATH.name} (rows: {len(df)}, columns: {len(df.columns)})\n\n")
    for name, metrics in results.items():
        f.write(f"## {name.replace('_', ' ').title()}\n")
        f.write(f"- Accuracy: {metrics['accuracy']:.4f}\n")
        f.write(f"- Macro F1: {metrics['macro_f1']:.4f}\n\n")
        f.write("### Per‑class metrics\n")
        for cls, vals in metrics['per_class'].items():
            if cls in ['accuracy', 'macro avg', 'weighted avg']:
                continue
            f.write(f"- **{cls}** – Precision: {vals['precision']:.4f}, Recall: {vals['recall']:.4f}, F1: {vals['f1-score']:.4f}\n")
        f.write("\n---\n\n")

print("Training completed. Model saved to", MODEL_PATH)
print("Evaluation results saved to", EVAL_PATH)
print("Report generated at", REPORT_PATH)
