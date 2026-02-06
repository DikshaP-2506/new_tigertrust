"""
TigerTrust System Test
Verifies all components are configured correctly
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'
BLUE = '\033[94m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{text:^60}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def print_test(name, passed, message=""):
    status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
    print(f"{status} {name}")
    if message:
        print(f"     {message}")

def test_environment_variables():
    """Test if required environment variables are set"""
    print_header("Testing Environment Variables")
    
    required_vars = {
        'GEMINI_API_KEY': 'Google Gemini API key',
        'SOLANA_RPC_URL': 'Solana RPC endpoint',
        'TIGERTRUST_PROGRAM_ID': 'TigerTrust program ID',
    }
    
    all_passed = True
    for var, description in required_vars.items():
        value = os.getenv(var)
        if value:
            print_test(f"{var}", True, f"{description}: {value[:20]}...")
        else:
            print_test(f"{var}", False, f"{description}: NOT SET")
            all_passed = False
    
    return all_passed

def test_python_dependencies():
    """Test if Python dependencies are installed"""
    print_header("Testing Python Dependencies")
    
    dependencies = [
        'google.generativeai',
        'flask',
        'solana',
        'solders',
        'requests',
        'dotenv'
    ]
    
    all_passed = True
    for dep in dependencies:
        try:
            __import__(dep)
            print_test(f"{dep}", True)
        except ImportError:
            print_test(f"{dep}", False, "Not installed")
            all_passed = False
    
    return all_passed

def test_gemini_api():
    """Test Gemini API connection"""
    print_header("Testing Gemini API")
    
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print_test("Gemini API Key", False, "GEMINI_API_KEY not set")
            return False
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Simple test
        response = model.generate_content("Say 'OK' if you're working")
        
        if response and response.text:
            print_test("Gemini API Connection", True, f"Response: {response.text[:50]}")
            return True
        else:
            print_test("Gemini API Connection", False, "No response")
            return False
            
    except Exception as e:
        print_test("Gemini API Connection", False, str(e))
        return False

def test_api_service(port=5001):
    """Test if AI Scoring API is running"""
    print_header("Testing AI Scoring API Service")
    
    try:
        response = requests.get(f'http://localhost:{port}/health', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_test("API Service", True, f"Status: {data.get('status')}")
            print_test("Gemini Configured", data.get('gemini_configured', False))
            print_test("Solana Configured", data.get('solana_configured', False))
            return True
        else:
            print_test("API Service", False, f"Status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_test("API Service", False, f"Not running on port {port}")
        print(f"     {YELLOW}Start with: python api.py{RESET}")
        return False
    except Exception as e:
        print_test("API Service", False, str(e))
        return False

def test_rse_server(port=4000):
    """Test if RSE Server is running"""
    print_header("Testing RSE Server")
    
    try:
        response = requests.get(f'http://localhost:{port}/', timeout=5)
        
        if response.status_code == 200:
            print_test("RSE Server", True, "Server is running")
            return True
        else:
            print_test("RSE Server", False, f"Status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_test("RSE Server", False, f"Not running on port {port}")
        print(f"     {YELLOW}Start with: cd rse-server && npm run dev{RESET}")
        return False
    except Exception as e:
        print_test("RSE Server", False, str(e))
        return False

def test_human_verification(port=5000):
    """Test if Human Verification service is running"""
    print_header("Testing Human Verification Service")
    
    try:
        response = requests.get(f'http://localhost:{port}/health', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_test("Verification Service", True, f"Status: {data.get('status')}")
            return True
        else:
            print_test("Verification Service", False, f"Status code: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_test("Verification Service", False, f"Not running on port {port}")
        print(f"     {YELLOW}Start with: cd human_verification && python app.py{RESET}")
        return False
    except Exception as e:
        print_test("Verification Service", False, str(e))
        return False

def test_scorer_module():
    """Test if scorer module works"""
    print_header("Testing Scorer Module")
    
    try:
        from gemini_scorer import TigerScoreAI
        
        scorer = TigerScoreAI()
        print_test("Scorer Initialization", True)
        
        # Test with sample data
        test_data = {
            'wallet_address': 'test_wallet',
            'wallet_age_days': 100,
            'tx_count': 50,
            'human_verified': True,
            'total_loans': 1,
            'successful_repayments': 1,
            'defaults': 0
        }
        
        result = scorer.calculate_score(test_data)
        
        if result and 'tiger_score' in result:
            print_test("Score Calculation", True, f"Score: {result['tiger_score']} ({result.get('tier')})")
            return True
        else:
            print_test("Score Calculation", False, "Invalid result")
            return False
            
    except Exception as e:
        print_test("Scorer Module", False, str(e))
        return False

def print_summary(results):
    """Print test summary"""
    print_header("Test Summary")
    
    total = len(results)
    passed = sum(results.values())
    failed = total - passed
    
    print(f"Total Tests: {total}")
    print(f"{GREEN}Passed: {passed}{RESET}")
    print(f"{RED}Failed: {failed}{RESET}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if failed == 0:
        print(f"\n{GREEN}🎉 All tests passed! System is ready.{RESET}\n")
    else:
        print(f"\n{YELLOW}⚠️  Some tests failed. Please check configuration.{RESET}\n")

def main():
    """Run all tests"""
    print(f"\n{BLUE}╔════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║          TigerTrust System Configuration Test             ║{RESET}")
    print(f"{BLUE}╚════════════════════════════════════════════════════════════╝{RESET}")
    
    results = {}
    
    # Run tests
    results['Environment Variables'] = test_environment_variables()
    results['Python Dependencies'] = test_python_dependencies()
    results['Gemini API'] = test_gemini_api()
    results['Scorer Module'] = test_scorer_module()
    results['AI Scoring API'] = test_api_service()
    results['RSE Server'] = test_rse_server()
    results['Human Verification'] = test_human_verification()
    
    # Print summary
    print_summary(results)
    
    # Exit with appropriate code
    sys.exit(0 if all(results.values()) else 1)

if __name__ == "__main__":
    main()
