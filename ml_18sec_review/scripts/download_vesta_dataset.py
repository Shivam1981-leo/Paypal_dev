"""Download IEEE-CIS Fraud Detection Dataset (Vesta Corporation data) - Windows Compatible

Requirements:
    pip install kaggle

Setup Kaggle API:
    1. Go to https://www.kaggle.com/settings/account
    2. Create New API Token (downloads kaggle.json)
    3. Place kaggle.json in:
       - Windows: C:/Users/<username>/.kaggle/kaggle.json
       - Linux/Mac: ~/.kaggle/kaggle.json
"""

import os
import sys
from pathlib import Path
import zipfile

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

try:
    from kaggle.api.kaggle_api_extended import KaggleApi
except ImportError:
    print("ERROR: kaggle package not installed")
    print("Run: pip install kaggle")
    sys.exit(1)


def check_kaggle_credentials():
    """Check if Kaggle API credentials are configured"""
    kaggle_json = Path.home() / ".kaggle" / "kaggle.json"

    if not kaggle_json.exists():
        print("ERROR: Kaggle credentials not found!")
        print("\nSetup instructions:")
        print("1. Go to https://www.kaggle.com/settings/account")
        print("2. Click 'Create New API Token'")
        print("3. Save kaggle.json to:", kaggle_json.parent)
        print("4. Make sure the file has correct permissions")
        return False

    return True


def download_dataset():
    """Download IEEE-CIS Fraud Detection dataset from Kaggle"""

    print("\n=== PayGuard AI - Vesta Dataset Downloader ===\n")

    # Check credentials
    if not check_kaggle_credentials():
        sys.exit(1)

    # Initialize Kaggle API
    api = KaggleApi()
    api.authenticate()

    print("OK: Kaggle API authenticated\n")

    # Setup paths
    project_root = Path(__file__).parent.parent
    raw_data_dir = project_root / "data" / "raw"
    raw_data_dir.mkdir(parents=True, exist_ok=True)

    # Dataset information
    competition_name = "ieee-fraud-detection"

    print(f"Downloading dataset: {competition_name}")
    print(f"Destination: {raw_data_dir}")
    print("\nThis may take 5-10 minutes (~1.2 GB)...\n")

    try:
        # Download all competition files
        api.competition_download_files(
            competition_name,
            path=str(raw_data_dir)
        )

        print("\nOK: Download complete!")

        # Extract ZIP files
        print("\nExtracting files...")

        zip_file = raw_data_dir / f"{competition_name}.zip"

        if zip_file.exists():
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                zip_ref.extractall(raw_data_dir)

            print("OK: Extraction complete!")

            # Remove zip file to save space
            zip_file.unlink()
            print("Cleaned up ZIP file")

        # List downloaded files
        print("\nDownloaded files:")
        for file in sorted(raw_data_dir.glob("*.csv")):
            size_mb = file.stat().st_size / (1024 * 1024)
            print(f"  - {file.name} ({size_mb:.1f} MB)")

        print("\nOK: Dataset ready!")
        print("\nNext steps:")
        print("  1. Preprocess data: python scripts/preprocess_vesta_data.py")
        print("  2. Train model: python scripts/train_model.py")

        return True

    except Exception as e:
        print(f"\nERROR: Failed to download dataset: {e}")
        print("\nTroubleshooting:")
        print("1. Accept competition rules at: https://www.kaggle.com/c/ieee-fraud-detection/rules")
        print("2. Verify Kaggle credentials are correct")
        print("3. Check internet connection")
        return False


def verify_dataset():
    """Verify dataset files are present and valid"""

    project_root = Path(__file__).parent.parent
    raw_data_dir = project_root / "data" / "raw"

    required_files = [
        "train_transaction.csv",
        "train_identity.csv",
        "test_transaction.csv",
        "test_identity.csv",
    ]

    print("\nVerifying dataset files...")

    all_present = True
    for filename in required_files:
        filepath = raw_data_dir / filename
        if filepath.exists():
            size_mb = filepath.stat().st_size / (1024 * 1024)
            print(f"  OK: {filename} ({size_mb:.1f} MB)")
        else:
            print(f"  MISSING: {filename}")
            all_present = False

    return all_present


def main():
    # Check if dataset already exists
    project_root = Path(__file__).parent.parent
    raw_data_dir = project_root / "data" / "raw"
    train_file = raw_data_dir / "train_transaction.csv"

    if train_file.exists():
        print("\nDataset already exists!")
        if verify_dataset():
            print("\nOK: All files verified. Dataset is ready to use.")
            print("\nTo re-download, delete the 'data/raw' folder first.")
            return

    # Download dataset
    success = download_dataset()

    if success:
        verify_dataset()
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
