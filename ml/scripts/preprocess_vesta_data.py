"""Preprocess IEEE-CIS Fraud Detection Dataset (Vesta data) for training

Handles:
- Loading transaction and identity tables
- Merging datasets
- Feature engineering
- Missing value imputation
- Train/validation split
- Saving processed data
"""

import sys
from pathlib import Path
import polars as pl
import numpy as np
from typing import Tuple
import io

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

class VestaDataPreprocessor:
    """Preprocess Vesta/IEEE-CIS fraud detection dataset"""

    def __init__(self):
        pass

    def load_raw_data(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Load raw transaction and identity data"""

        print("\nLoading Loading raw Vesta dataset...")

        raw_dir = Path(__file__).parent.parent / "data" / "raw"

        # Load transaction data
        print("  Loading train_transaction.csv...")
        df_trans = pl.read_csv(
            raw_dir / "train_transaction.csv",
            infer_schema_length=10000
        )

        # Load identity data
        print("  Loading train_identity.csv...")
        df_identity = pl.read_csv(
            raw_dir / "train_identity.csv",
            infer_schema_length=10000
        )

        print(f"  OK: Loaded {len(df_trans):,} transactions")
        print(f"  OK: Loaded {len(df_identity):,} identity records")

        return df_trans, df_identity

    def merge_datasets(
        self,
        df_trans: pl.DataFrame,
        df_identity: pl.DataFrame
    ) -> pl.DataFrame:
        """Merge transaction and identity tables"""

        print("\nMerging Merging transaction and identity data...")

        # Left join on TransactionID
        df = df_trans.join(
            df_identity,
            on="TransactionID",
            how="left"
        )

        print(f"  OK: Merged dataset: {len(df):,} rows, {len(df.columns)} columns")

        return df

    def engineer_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Create additional features from Vesta data"""

        print("\nEngineering  Engineering features...")

        # TransactionAmt statistics
        df = df.with_columns([
            # Log of transaction amount (handle skewness)
            pl.col("TransactionAmt").log1p().alias("TransactionAmt_log"),

            # Transaction amount decimal part (fraud indicator)
            (pl.col("TransactionAmt") - pl.col("TransactionAmt").floor()).alias("TransactionAmt_decimal"),

            # Hour of day from TransactionDT (seconds since reference point)
            (pl.col("TransactionDT") / 3600 % 24).cast(pl.Int32).alias("transaction_hour"),

            # Day of week
            (pl.col("TransactionDT") / (3600 * 24) % 7).cast(pl.Int32).alias("transaction_dow"),
        ])

        # Card features
        if "card1" in df.columns:
            df = df.with_columns([
                # Card1 count encoding (will be done properly in next step)
                pl.col("card1").alias("card1_count")
            ])

        # Email domain features
        if "P_emaildomain" in df.columns and "R_emaildomain" in df.columns:
            df = df.with_columns([
                # Email domains match
                (pl.col("P_emaildomain") == pl.col("R_emaildomain")).cast(pl.Int32).alias("email_domains_match")
            ])

        # Device info features
        if "DeviceInfo" in df.columns:
            df = df.with_columns([
                # Extract device type
                pl.col("DeviceInfo").str.contains("(?i)windows").cast(pl.Int32).alias("device_is_windows"),
                pl.col("DeviceInfo").str.contains("(?i)ios").cast(pl.Int32).alias("device_is_ios"),
                pl.col("DeviceInfo").str.contains("(?i)android").cast(pl.Int32).alias("device_is_android"),
                pl.col("DeviceInfo").str.contains("(?i)mac").cast(pl.Int32).alias("device_is_mac"),
            ])

        print(f"  OK: Feature engineering complete: {len(df.columns)} total columns")

        return df

    def handle_missing_values(self, df: pl.DataFrame) -> pl.DataFrame:
        """Handle missing values in the dataset"""

        print("\nHandling Handling missing values...")

        # Get missing value counts
        missing_counts = df.null_count()

        # For numeric columns, fill with -999 (to preserve missingness signal)
        numeric_cols = [
            col for col in df.columns
            if df[col].dtype in [pl.Float64, pl.Float32, pl.Int64, pl.Int32, pl.Int16, pl.Int8]
            and col != "isFraud"  # Don't touch the target
        ]

        df = df.with_columns([
            pl.col(col).fill_null(-999) for col in numeric_cols
        ])

        # For categorical columns, fill with "unknown"
        categorical_cols = [
            col for col in df.columns
            if df[col].dtype == pl.Utf8
        ]

        df = df.with_columns([
            pl.col(col).fill_null("unknown") for col in categorical_cols
        ])

        print(f"  OK: Filled nulls in {len(numeric_cols)} numeric columns")
        print(f"  OK: Filled nulls in {len(categorical_cols)} categorical columns")

        return df

    def create_train_val_split(
        self,
        df: pl.DataFrame,
        val_size: float = 0.2
    ) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Split data into train and validation sets (time-based)"""

        print(f"\nCreating Creating train/validation split ({1-val_size:.0%}/{val_size:.0%})...")

        # Sort by TransactionDT to maintain temporal order
        df = df.sort("TransactionDT")

        # Time-based split (last 20% for validation)
        split_idx = int(len(df) * (1 - val_size))

        train_df = df[:split_idx]
        val_df = df[split_idx:]

        print(f"  OK: Training set: {len(train_df):,} samples")
        print(f"  OK: Validation set: {len(val_df):,} samples")

        # Check fraud rates
        train_fraud_rate = train_df["isFraud"].mean()
        val_fraud_rate = val_df["isFraud"].mean()

        print(f"  📈 Train fraud rate: {train_fraud_rate:.2%}")
        print(f"  📈 Val fraud rate: {val_fraud_rate:.2%}")

        return train_df, val_df

    def save_processed_data(
        self,
        train_df: pl.DataFrame,
        val_df: pl.DataFrame
    ):
        """Save processed datasets"""

        print("\nSaving Saving processed data...")

        processed_dir = Path(__file__).parent.parent / "data" / "processed"
        processed_dir.mkdir(parents=True, exist_ok=True)

        # Save as parquet (much smaller and faster than CSV)
        train_path = processed_dir / "vesta_train.parquet"
        val_path = processed_dir / "vesta_val.parquet"

        train_df.write_parquet(train_path)
        val_df.write_parquet(val_path)

        train_size_mb = train_path.stat().st_size / (1024 * 1024)
        val_size_mb = val_path.stat().st_size / (1024 * 1024)

        print(f"  OK: Training data: {train_path.name} ({train_size_mb:.1f} MB)")
        print(f"  OK: Validation data: {val_path.name} ({val_size_mb:.1f} MB)")

    def process(self):
        """Run full preprocessing pipeline"""

        print("\n=== PayGuard AI - Vesta Data Preprocessing\n")

        # Load raw data
        df_trans, df_identity = self.load_raw_data()

        # Merge datasets
        df = self.merge_datasets(df_trans, df_identity)

        # Engineer features
        df = self.engineer_features(df)

        # Handle missing values
        df = self.handle_missing_values(df)

        # Create train/val split
        train_df, val_df = self.create_train_val_split(df)

        # Save processed data
        self.save_processed_data(train_df, val_df)

        print("\nOK: Preprocessing complete!")
        print("\nNext steps:")
        print("  1. Train model: python scripts/train_model.py")
        print("  2. Evaluate: python scripts/evaluate_model.py")


def main():
    preprocessor = VestaDataPreprocessor()
    preprocessor.process()


if __name__ == "__main__":
    main()
