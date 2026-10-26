import csv, json, pathlib, sys
csv_path = pathlib.Path(r'd:\projects\inventory\crams_dataset_1000.csv')
if not csv_path.is_file():
    print('CSV file not found')
    sys.exit(1)
with csv_path.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
    total_rows = len(rows)
    columns = reader.fieldnames
    missing_per_column = {col: sum(1 for r in rows if r[col] == '' or r[col] is None) for col in columns}
    duplicate_rows = len(rows) - len({tuple(r[col] for col in columns) for r in rows})
    class_distribution = {}
    if 'risk_level' in columns:
        for r in rows:
            cl = r['risk_level']
            class_distribution[cl] = class_distribution.get(cl, 0) + 1
    summary = {
        'rows': total_rows,
        'columns': len(columns),
        'missing_per_column': missing_per_column,
        'duplicate_rows': duplicate_rows,
        'class_distribution': class_distribution,
        'column_names': columns,
    }
    out_path = pathlib.Path(r'C:\Users\vaishnav\.gemini\antigravity-ide\brain\c7b291f6-535d-4346-9b79-640ee84236ce\evaluation_summary.json')
    out_path.write_text(json.dumps(summary, indent=2))
    print('Summary written to', out_path)
    print(json.dumps(summary, indent=2))
