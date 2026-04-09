import splitfolders

splitfolders.ratio(
    "archive",   # your extracted folder
    output="dataset",           # output folder
    seed=42,
    ratio=(0.8, 0.2)           # 80% train, 20% test
)