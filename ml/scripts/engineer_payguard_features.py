"""Engineer PayGuard-specific features from Vesta dataset

This script transforms Vesta's raw anonymized features into PayGuard's
domain-specific feature schema that matches the backend API expectations.

Feature Engineering Strategy:
1. Transaction Velocity: Extract from TransactionDT temporal patterns
2. Device Risk: Derive from DeviceType/DeviceInfo
3. Email Domain Risk: Calculate from P_emaildomain/R_emaildomain
4. Geographic Risk: Build from card fields and addr1/addr2
5. Behavioral Patterns: Engineer from C1-C14 aggregated features
6. Account Age Indicators: Derive from id_* identity features
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


class PayGuardFeatureEngineer:
    """Engineer PayGuard features from Vesta dataset"""

    def __init__(self):
        self.high_risk_email_domains = [
            'guerrillamail.com', 'mailinator.com', 'tempmail.com',
            'throwaway.email', '10minutemail.com', 'yopmail.com'
        ]

    def load_raw_data(self) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Load raw transaction and identity data"""

        print("\n" + "="*70)
        print("PAYGUARD FEATURE ENGINEERING - VESTA DATASET")
        print("="*70 + "\n")
        print("Loading raw Vesta dataset...")

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

        print(f"  ✓ Loaded {len(df_trans):,} transactions")
        print(f"  ✓ Loaded {len(df_identity):,} identity records")

        return df_trans, df_identity

    def merge_datasets(
        self,
        df_trans: pl.DataFrame,
        df_identity: pl.DataFrame
    ) -> pl.DataFrame:
        """Merge transaction and identity tables"""

        print("\nMerging transaction and identity data...")

        # Left join on TransactionID
        df = df_trans.join(
            df_identity,
            on="TransactionID",
            how="left"
        )

        print(f"  ✓ Merged dataset: {len(df):,} rows, {len(df.columns)} columns")

        return df

    def engineer_payguard_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Transform Vesta features into PayGuard schema"""

        print("\n" + "="*70)
        print("ENGINEERING PAYGUARD FEATURES")
        print("="*70)

        # ===================================================================
        # 1. TRANSACTION AMOUNT FEATURES
        # ===================================================================
        print("\n[1/10] Transaction amount features...")

        df = df.with_columns([
            # Basic amount features
            pl.col("TransactionAmt").alias("transaction_amount"),
            pl.col("TransactionAmt").log1p().alias("transaction_amount_log"),
            (pl.col("TransactionAmt") - pl.col("TransactionAmt").floor()).alias("transaction_amount_decimal"),

            # Amount risk indicators
            (pl.col("TransactionAmt") > 1000).cast(pl.Int32).alias("is_high_amount"),
            (pl.col("TransactionAmt") > 5000).cast(pl.Int32).alias("is_very_high_amount"),
            (pl.col("TransactionAmt") < 5).cast(pl.Int32).alias("is_micro_transaction"),
        ])

        print("  ✓ Created 6 transaction amount features")

        # ===================================================================
        # 2. TEMPORAL/VELOCITY FEATURES (from TransactionDT)
        # ===================================================================
        print("\n[2/10] Temporal and velocity features...")

        df = df.with_columns([
            # Time features (TransactionDT is seconds from reference point)
            (pl.col("TransactionDT") / 3600 % 24).cast(pl.Int32).alias("transaction_hour"),
            (pl.col("TransactionDT") / (3600 * 24) % 7).cast(pl.Int32).alias("transaction_day_of_week"),
            (pl.col("TransactionDT") / 3600).cast(pl.Int32).alias("transaction_hour_absolute"),

            # Time-based risk indicators
            ((pl.col("TransactionDT") / 3600 % 24).is_between(0, 6)).cast(pl.Int32).alias("is_late_night"),
            ((pl.col("TransactionDT") / (3600 * 24) % 7).is_in([5, 6])).cast(pl.Int32).alias("is_weekend"),
        ])

        # Velocity features (transactions per time window by card/email)
        # Calculate using window functions
        if "card1" in df.columns:
            df = df.with_columns([
                pl.col("TransactionID").count().over("card1").alias("card_transaction_count"),
                pl.col("TransactionAmt").mean().over("card1").alias("card_avg_amount"),
                pl.col("TransactionAmt").std().over("card1").alias("card_amount_std"),
            ])

        if "P_emaildomain" in df.columns:
            df = df.with_columns([
                pl.col("TransactionID").count().over("P_emaildomain").alias("email_transaction_count"),
                pl.col("TransactionAmt").mean().over("P_emaildomain").alias("email_avg_amount"),
            ])

        print("  ✓ Created 10 temporal/velocity features")

        # ===================================================================
        # 3. DEVICE FEATURES (from DeviceType/DeviceInfo)
        # ===================================================================
        print("\n[3/10] Device fingerprinting features...")

        device_features = []

        if "DeviceType" in df.columns:
            df = df.with_columns([
                (pl.col("DeviceType") == "mobile").cast(pl.Int32).alias("device_is_mobile"),
                (pl.col("DeviceType") == "desktop").cast(pl.Int32).alias("device_is_desktop"),
                pl.col("DeviceType").is_null().cast(pl.Int32).alias("device_type_missing"),
            ])
            device_features.extend(["device_is_mobile", "device_is_desktop", "device_type_missing"])

        if "DeviceInfo" in df.columns:
            df = df.with_columns([
                pl.col("DeviceInfo").str.to_lowercase().str.contains("windows").cast(pl.Int32).alias("device_os_windows"),
                pl.col("DeviceInfo").str.to_lowercase().str.contains("ios").cast(pl.Int32).alias("device_os_ios"),
                pl.col("DeviceInfo").str.to_lowercase().str.contains("android").cast(pl.Int32).alias("device_os_android"),
                pl.col("DeviceInfo").str.to_lowercase().str.contains("mac").cast(pl.Int32).alias("device_os_mac"),
                pl.col("DeviceInfo").is_null().cast(pl.Int32).alias("device_info_missing"),
            ])
            device_features.extend([
                "device_os_windows", "device_os_ios", "device_os_android",
                "device_os_mac", "device_info_missing"
            ])

        # Device risk score (more missing info = higher risk)
        df = df.with_columns([
            (pl.col("device_type_missing") + pl.col("device_info_missing")).alias("device_risk_score")
        ])

        print(f"  ✓ Created {len(device_features) + 1} device features")

        # ===================================================================
        # 4. EMAIL DOMAIN FEATURES
        # ===================================================================
        print("\n[4/10] Email domain risk features...")

        if "P_emaildomain" in df.columns and "R_emaildomain" in df.columns:
            # Email domains match
            df = df.with_columns([
                (pl.col("P_emaildomain") == pl.col("R_emaildomain")).cast(pl.Int32).alias("email_domains_match"),
                pl.col("P_emaildomain").is_null().cast(pl.Int32).alias("purchaser_email_missing"),
                pl.col("R_emaildomain").is_null().cast(pl.Int32).alias("recipient_email_missing"),
            ])

            # High-risk email domains (disposable email services)
            # Note: Vesta data is anonymized, but we can identify patterns
            df = df.with_columns([
                # Popular domains (gmail, yahoo, hotmail) are typically lower risk
                pl.col("P_emaildomain").str.to_lowercase().is_in(
                    ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
                ).cast(pl.Int32).alias("email_is_popular_domain"),

                # Count of email domain usage (rare domains = higher risk)
                pl.col("TransactionID").count().over("P_emaildomain").alias("email_domain_frequency"),
            ])

            print("  ✓ Created 6 email domain features")
        else:
            print("  ⚠ Email columns not found, skipping email features")

        # ===================================================================
        # 5. GEOGRAPHIC FEATURES (from addr1, addr2, card fields)
        # ===================================================================
        print("\n[5/10] Geographic risk features...")

        if "addr1" in df.columns and "addr2" in df.columns:
            df = df.with_columns([
                pl.col("addr1").is_null().cast(pl.Int32).alias("billing_address_missing"),
                pl.col("addr2").is_null().cast(pl.Int32).alias("shipping_address_missing"),
                (pl.col("addr1") == pl.col("addr2")).cast(pl.Int32).alias("billing_shipping_match"),
            ])

            # Address frequency (unusual addresses = higher risk)
            df = df.with_columns([
                pl.col("TransactionID").count().over("addr1").alias("billing_address_frequency"),
                pl.col("TransactionID").count().over("addr2").alias("shipping_address_frequency"),
            ])

            print("  ✓ Created 5 geographic features")
        else:
            print("  ⚠ Address columns not found, skipping geographic features")

        # ===================================================================
        # 6. CARD FEATURES
        # ===================================================================
        print("\n[6/10] Card-based features...")

        card_features_count = 0
        if "card1" in df.columns:
            df = df.with_columns([
                # Card usage frequency
                pl.col("TransactionID").count().over("card1").alias("card_usage_frequency"),
            ])
            card_features_count += 1

        if "card2" in df.columns:
            df = df.with_columns([
                pl.col("card2").is_null().cast(pl.Int32).alias("card2_missing"),
            ])
            card_features_count += 1

        if "card3" in df.columns:
            df = df.with_columns([
                pl.col("card3").is_null().cast(pl.Int32).alias("card3_missing"),
            ])
            card_features_count += 1

        if "card4" in df.columns:
            df = df.with_columns([
                # Card type indicators
                (pl.col("card4") == "visa").cast(pl.Int32).alias("card_is_visa"),
                (pl.col("card4") == "mastercard").cast(pl.Int32).alias("card_is_mastercard"),
                pl.col("card4").is_null().cast(pl.Int32).alias("card_type_missing"),
            ])
            card_features_count += 3

        if "card6" in df.columns:
            df = df.with_columns([
                # Card category (debit/credit)
                (pl.col("card6") == "debit").cast(pl.Int32).alias("card_is_debit"),
                (pl.col("card6") == "credit").cast(pl.Int32).alias("card_is_credit"),
            ])
            card_features_count += 2

        print(f"  ✓ Created {card_features_count} card features")

        # ===================================================================
        # 7. DISTANCE FEATURES (dist1, dist2)
        # ===================================================================
        print("\n[7/10] Distance features...")

        if "dist1" in df.columns and "dist2" in df.columns:
            df = df.with_columns([
                pl.col("dist1").fill_null(-999).alias("distance_billing_address"),
                pl.col("dist2").fill_null(-999).alias("distance_shipping_address"),
                (pl.col("dist1") > 100).cast(pl.Int32).alias("is_large_distance_billing"),
                (pl.col("dist2") > 100).cast(pl.Int32).alias("is_large_distance_shipping"),
            ])
            print("  ✓ Created 4 distance features")
        else:
            print("  ⚠ Distance columns not found, skipping")

        # ===================================================================
        # 8. PRODUCT FEATURES
        # ===================================================================
        print("\n[8/10] Product category features...")

        if "ProductCD" in df.columns:
            # One-hot encode ProductCD
            product_categories = df["ProductCD"].unique().to_list()
            for prod in product_categories[:5]:  # Top 5 products
                if prod is not None:
                    df = df.with_columns([
                        (pl.col("ProductCD") == prod).cast(pl.Int32).alias(f"product_is_{prod.lower()}")
                    ])
            print(f"  ✓ Created {min(5, len(product_categories))} product features")
        else:
            print("  ⚠ ProductCD not found")

        # ===================================================================
        # 9. BEHAVIORAL FEATURES (C1-C14 aggregated counts)
        # ===================================================================
        print("\n[9/10] Behavioral pattern features...")

        c_columns = [col for col in df.columns if col.startswith("C") and len(col) <= 3]
        if c_columns:
            # These are count features - aggregate them
            for c_col in c_columns[:10]:  # Use first 10
                df = df.with_columns([
                    pl.col(c_col).fill_null(0).alias(f"{c_col}_count")
                ])

            # Sum of all behavioral counts
            if len(c_columns) > 0:
                df = df.with_columns([
                    pl.sum_horizontal([col for col in c_columns[:10]]).alias("total_behavioral_counts")
                ])

            print(f"  ✓ Created {len(c_columns[:10]) + 1} behavioral features")
        else:
            print("  ⚠ C columns not found")

        # ===================================================================
        # 10. IDENTITY FEATURES (id_01 to id_38)
        # ===================================================================
        print("\n[10/10] Identity verification features...")

        id_columns = [col for col in df.columns if col.startswith("id_")]
        if id_columns:
            # Count missing identity fields (more missing = higher risk)
            id_missing_count = sum([
                pl.col(col).is_null().cast(pl.Int32)
                for col in id_columns[:15]  # Use first 15
            ])

            df = df.with_columns([
                id_missing_count.alias("identity_fields_missing_count")
            ])

            # Use top important id fields as-is (after filling nulls)
            for id_col in id_columns[:10]:  # Top 10 id fields
                df = df.with_columns([
                    pl.col(id_col).fill_null(-999).alias(f"{id_col}_filled")
                ])

            print(f"  ✓ Created {11} identity features")
        else:
            print("  ⚠ Identity columns not found")

        # ===================================================================
        # COMPOSITE RISK SCORES
        # ===================================================================
        print("\nCalculating composite risk scores...")

        df = df.with_columns([
            # Overall missing data score (more missing = higher risk)
            (
                pl.col("device_risk_score") +
                pl.col("purchaser_email_missing") +
                pl.col("billing_address_missing")
            ).alias("overall_missing_data_score"),

            # Velocity risk (high transaction count in short time)
            (pl.col("card_transaction_count") > 10).cast(pl.Int32).alias("high_velocity_flag"),
        ])

        print("  ✓ Created 2 composite risk scores")

        print("\n" + "="*70)
        print(f"✓ FEATURE ENGINEERING COMPLETE: {len(df.columns)} total features")
        print("="*70)

        return df

    def select_payguard_features(self, df: pl.DataFrame) -> pl.DataFrame:
        """Select final PayGuard feature set for training"""

        print("\nSelecting final PayGuard feature set...")

        # Get all engineered feature names (exclude raw input columns)
        exclude_cols = (
            ["TransactionID", "TransactionDT", "TransactionAmt"]  # Raw transaction cols
            + [f"V{i}" for i in range(1, 340)]  # Raw V columns (we'll add selected ones back)
            + [f"id_{i:02d}" for i in range(1, 39)]  # Raw id columns (we use _filled versions)
            + ["ProductCD", "card1", "card2", "card3", "card4", "card5", "card6",
               "addr1", "addr2", "P_emaildomain", "R_emaildomain", "DeviceType", "DeviceInfo",
               "dist1", "dist2"]
            + [f"C{i}" for i in range(1, 15)]  # Raw C columns (we use _count versions)
        )

        # Get all available columns except excluded ones
        available_features = [
            col for col in df.columns
            if col not in exclude_cols
        ]

        # Include a selection of high-value V columns (known to be important from Kaggle discussions)
        important_v_columns = [
            f"V{i}" for i in [12, 13, 34, 37, 44, 45, 53, 56, 61, 62, 69, 70, 75, 76, 78, 82,
                             87, 91, 94, 95, 96, 107, 126, 127, 130, 133, 258, 279, 280, 283]
            if f"V{i}" in df.columns
        ][:20]  # Top 20 V features

        # Combine feature sets and remove duplicates
        selected_features = list(dict.fromkeys(available_features + important_v_columns))

        # Ensure all features exist in dataframe
        selected_features = [col for col in selected_features if col in df.columns]

        # Select features
        df_final = df.select(selected_features)

        # Handle string/categorical columns - convert to numeric or one-hot encode
        print(f"\nProcessing data types...")

        string_cols = [col for col in df_final.columns if df_final[col].dtype == pl.Utf8]

        if string_cols:
            print(f"  Converting {len(string_cols)} string columns to numeric...")

            # For each string column, convert to categorical codes
            for col in string_cols:
                # Get unique values and create mapping
                unique_vals = df_final[col].unique().to_list()

                # Create numeric mapping (None -> -999)
                mapping_dict = {val: idx for idx, val in enumerate(unique_vals) if val is not None}
                mapping_dict[None] = -999

                # Replace string column with numeric codes
                df_final = df_final.with_columns([
                    pl.col(col).replace(mapping_dict, default=-999).cast(pl.Int32).alias(f"{col}_encoded")
                ])

            # Drop original string columns, keep encoded versions
            df_final = df_final.drop(string_cols)

            print(f"  ✓ Converted to numeric encodings")

        # Fill any remaining nulls in numeric columns
        for col in df_final.columns:
            if col == "isFraud":
                continue
            if df_final[col].dtype in [pl.Float64, pl.Float32, pl.Int64, pl.Int32]:
                df_final = df_final.with_columns([
                    pl.col(col).fill_null(-999)
                ])

        print(f"\n  ✓ Selected {len(df_final.columns) - 1} features for training (+ target)")
        print(f"  ✓ Features: {', '.join(df_final.columns[:10])}...")

        return df_final

    def create_train_val_split(
        self,
        df: pl.DataFrame,
        val_size: float = 0.2
    ) -> Tuple[pl.DataFrame, pl.DataFrame]:
        """Split data into train and validation sets (time-based)"""

        print(f"\nCreating train/validation split ({1-val_size:.0%}/{val_size:.0%})...")

        # Time-based split (last 20% for validation)
        split_idx = int(len(df) * (1 - val_size))

        train_df = df[:split_idx]
        val_df = df[split_idx:]

        print(f"  ✓ Training set: {len(train_df):,} samples")
        print(f"  ✓ Validation set: {len(val_df):,} samples")

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

        print("\nSaving processed PayGuard features...")

        processed_dir = Path(__file__).parent.parent / "data" / "processed"
        processed_dir.mkdir(parents=True, exist_ok=True)

        # Save as parquet
        train_path = processed_dir / "payguard_train.parquet"
        val_path = processed_dir / "payguard_val.parquet"

        train_df.write_parquet(train_path)
        val_df.write_parquet(val_path)

        train_size_mb = train_path.stat().st_size / (1024 * 1024)
        val_size_mb = val_path.stat().st_size / (1024 * 1024)

        print(f"  ✓ Training data: {train_path.name} ({train_size_mb:.1f} MB)")
        print(f"  ✓ Validation data: {val_path.name} ({val_size_mb:.1f} MB)")

    def process(self):
        """Run full PayGuard feature engineering pipeline"""

        # Load raw data
        df_trans, df_identity = self.load_raw_data()

        # Merge datasets
        df = self.merge_datasets(df_trans, df_identity)

        # Engineer PayGuard features
        df = self.engineer_payguard_features(df)

        # Select final feature set
        df = self.select_payguard_features(df)

        # Create train/val split
        train_df, val_df = self.create_train_val_split(df)

        # Save processed data
        self.save_processed_data(train_df, val_df)

        print("\n" + "="*70)
        print("✅ PAYGUARD FEATURE ENGINEERING COMPLETE!")
        print("="*70)
        print("\nNext steps:")
        print("  1. Train model: python scripts/train_payguard_model.py")
        print("  2. Validate features: Check feature importance matches domain expectations")
        print("  3. Test API integration: Ensure features work with backend schema")


def main():
    engineer = PayGuardFeatureEngineer()
    engineer.process()


if __name__ == "__main__":
    main()
