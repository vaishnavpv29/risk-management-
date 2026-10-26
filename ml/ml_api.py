
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "svm_model.joblib"

model = joblib.load(MODEL_PATH)

FEATURES = [
    "revenue_change_pct",
    "profit_change_pct",
    "expense_change_pct",
    "debt_ratio",
    "customer_demand_change_pct",
    "customer_churn_pct",
    "sales_change_pct",
    "downtime_hours",
    "operational_incidents",
    "delivery_delay_pct",
    "failed_login_attempts",
    "security_incidents",
    "vulnerability_count",
    "negative_feedback_pct",
    "average_rating",
    "sentiment_score",
]

app = FastAPI(title="CRAMS ML Risk Prediction API")


class RiskInput(BaseModel):
    revenue_change_pct: float
    profit_change_pct: float
    expense_change_pct: float
    debt_ratio: float
    customer_demand_change_pct: float
    customer_churn_pct: float
    sales_change_pct: float
    downtime_hours: float = Field(ge=0)
    operational_incidents: float = Field(ge=0)
    delivery_delay_pct: float
    failed_login_attempts: float = Field(ge=0)
    security_incidents: float = Field(ge=0)
    vulnerability_count: float = Field(ge=0)
    negative_feedback_pct: float
    average_rating: float
    sentiment_score: float


@app.get("/health")
def health():
    return {"status": "ok", "model": "SVM"}


@app.post("/predict")
def predict_risk(data: RiskInput):
    try:
        input_df = pd.DataFrame(
            [data.model_dump()],
            columns=FEATURES
        )

        prediction = str(model.predict(input_df)[0])
        result = {"predicted_risk_level": prediction}

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(input_df)[0]
            result["class_probabilities"] = {
                str(label): round(float(probability), 4)
                for label, probability in zip(
                    model.classes_, probabilities
                )
            }

        return result

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {exc}"
        ) from exc
