"""PyTest configuration"""

import sys
from pathlib import Path

# Add ml and ml/src to path for all tests
ml_dir = Path(__file__).parent.parent
sys.path.insert(0, str(ml_dir))
sys.path.insert(0, str(ml_dir / "src"))
