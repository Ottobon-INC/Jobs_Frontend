import urllib.request, sys

urls = {
    'tcs':          'https://upload.wikimedia.org/wikipedia/commons/9/9b/TATA_Consultancy_Services_Logo.svg',
    'wipro':        'https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg',
    'infosys':      'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    'google':       'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    'meta':         'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    'microsoft':    'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    'amazon':       'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    'apple':        'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    'nvidia':       'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg',
    'openai':       'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    'oracle':       'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
    'adobe':        'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png',
    'salesforce':   'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
    'accenture':    'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
    'ibm':          'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
    'capgemini':    'https://upload.wikimedia.org/wikipedia/commons/3/34/Capgemini_201x_logo.svg',
    'cognizant':    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Cognizant%27s_logo.svg',
    'hcl':          'https://upload.wikimedia.org/wikipedia/commons/f/f0/HCL_Technologies_logo.svg',
    'lti-mindtree': 'https://upload.wikimedia.org/wikipedia/commons/6/6c/LTIMindtree_Logo.svg',
    'hexaware':     'https://upload.wikimedia.org/wikipedia/commons/d/d5/Hexaware_Technologies_Logo.svg',
    'epam':         'https://upload.wikimedia.org/wikipedia/commons/e/e5/EPAM_Systems_logo.svg',
    'samsung':      'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    'micron':       'https://upload.wikimedia.org/wikipedia/commons/e/e6/Micron_Technology_logo.svg',
    'flipkart':     'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.png',
    'swiggy':       'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg',
    'phonepe':      'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg',
    'razorpay':     'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
}

for name, url in urls.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        resp = urllib.request.urlopen(req, timeout=5)
        print(f"OK   {name:20s} {resp.status} ({len(resp.read())} bytes)")
    except Exception as e:
        print(f"FAIL {name:20s} {e}")
