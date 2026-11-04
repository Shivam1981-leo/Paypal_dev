"""Script to generate synthetic fraud detection dataset"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from features.synthetic_data import SyntheticDataGenerator


def main():
    print("\n🚀 PayGuard AI - Synthetic Data Generation\n")

    # Initialize generator
    generator = SyntheticDataGenerator()

    # Generate dataset (10,000 legitimate + 1,000 fraud = 10% fraud rate)
    df = generator.generate_dataset(n_legitimate=10000, n_fraud=1000)

    # Ensure output directory exists
    output_dir = Path(__file__).parent.parent / "data" / "synthetic"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save to parquet
    output_path = output_dir / "transactions.parquet"
    generator.save_dataset(df, str(output_path))

    print("\n✅ Synthetic data generation complete!")
    print(f"📂 Output: {output_path}")
    print("\nNext steps:")
    print("  1. Run feature engineering: python scripts/preprocess_data.py")
    print("  2. Train model: python scripts/train_model.py")


if __name__ == "__main__":
    main()
