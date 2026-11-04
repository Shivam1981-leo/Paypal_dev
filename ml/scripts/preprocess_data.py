"""Data preprocessing script

Loads raw transaction data and applies feature engineering.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import polars as pl
from features.feature_engineering import FeatureEngineer


def main():
    print("\n🔧 PayGuard AI - Data Preprocessing\n")

    base_dir = Path(__file__).parent.parent

    # Load raw data
    data_path = base_dir / "data" / "synthetic" / "transactions.parquet"

    if not data_path.exists():
        print(f"❌ Data not found at {data_path}")
        print("Run: python scripts/generate_data.py")
        return

    print(f"Loading data from {data_path}...")
    df = pl.read_parquet(data_path)
    print(f"✓ Loaded {len(df):,} transactions\n")

    # Feature engineering
    print("Extracting features...")
    engineer = FeatureEngineer()
    df_features = engineer.extract_all_features(df)

    # Select model features
    feature_df = engineer.select_model_features(df_features)

    print(f"\n📊 Feature Engineering Summary:")
    print(f"  Raw columns: {len(df.columns)}")
    print(f"  Engineered features: {len(engineer.get_feature_names())}")
    print(f"  Total columns: {len(df_features.columns)}")
    print(f"  Model features: {len(feature_df.columns) - 1}")  # Exclude label

    # Save processed data
    output_dir = base_dir / "data" / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "features.parquet"
    feature_df.write_parquet(output_path)

    print(f"\n✅ Preprocessing complete!")
    print(f"📂 Output: {output_path}")

    # Show sample
    print(f"\nSample (first 3 rows):")
    print(feature_df.head(3))

    # Feature statistics
    print(f"\nFeature Statistics:")
    print(f"  Fraud rate: {feature_df['is_fraud'].mean()*100:.2f}%")
    print(f"  Legitimate: {(feature_df['is_fraud'] == 0).sum():,}")
    print(f"  Fraudulent: {(feature_df['is_fraud'] == 1).sum():,}")

    print("\nNext step: python scripts/train_model.py")


if __name__ == "__main__":
    main()
