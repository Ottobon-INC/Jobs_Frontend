"""Download company logos to public/logos/ for local serving."""
import urllib.request, os, time, json

OUT_DIR = r"c:\jobs_frontend\jobs.frontend\public\logos"
os.makedirs(OUT_DIR, exist_ok=True)

# slug -> (url, extension)
SOURCES = {
    'tcs':          ('https://upload.wikimedia.org/wikipedia/commons/9/9b/TATA_Consultancy_Services_Logo.svg', '.svg'),
    'wipro':        ('https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg', '.svg'),
    'infosys':      ('https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg', '.svg'),
    'google':       ('https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', '.svg'),
    'meta':         ('https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', '.svg'),
    'microsoft':    ('https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', '.svg'),
    'amazon':       ('https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', '.svg'),
    'apple':        ('https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', '.svg'),
    'nvidia':       ('https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', '.svg'),
    'openai':       ('https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', '.svg'),
    'oracle':       ('https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg', '.svg'),
    'adobe':        ('https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png', '.png'),
    'salesforce':   ('https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', '.svg'),
    'accenture':    ('https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg', '.svg'),
    'ibm':          ('https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg', '.svg'),
    'capgemini':    ('https://upload.wikimedia.org/wikipedia/commons/9/9d/Capgemini_logo_%282023%29.svg', '.svg'),
    'cognizant':    ('https://upload.wikimedia.org/wikipedia/commons/1/1e/Cognizant%27s_logo.svg', '.svg'),
    'hcl':          ('https://upload.wikimedia.org/wikipedia/commons/f/f0/HCL_Technologies_logo.svg', '.svg'),
    'lti-mindtree': ('https://upload.wikimedia.org/wikipedia/commons/6/6c/LTIMindtree_Logo.svg', '.svg'),
    'hexaware':     ('https://upload.wikimedia.org/wikipedia/commons/d/d5/Hexaware_Technologies_Logo.svg', '.svg'),
    'epam':         ('https://www.google.com/s2/favicons?domain=epam.com&sz=128', '.png'),
    'samsung-research': ('https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', '.svg'),
    'micron':       ('https://upload.wikimedia.org/wikipedia/commons/e/e6/Micron_Technology_logo.svg', '.svg'),
    'flipkart':     ('https://www.google.com/s2/favicons?domain=flipkart.com&sz=128', '.png'),
    'swiggy':       ('https://www.google.com/s2/favicons?domain=swiggy.com&sz=128', '.png'),
    'phonepe':      ('https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg', '.svg'),
    'razorpay':     ('https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg', '.svg'),
    'sarvam-ai':    ('https://avatars.githubusercontent.com/u/126110996?s=200&v=4', '.png'),
    'krutrim-ai':   ('https://avatars.githubusercontent.com/u/157467773?s=200&v=4', '.png'),
    'zepto':        ('https://www.google.com/s2/favicons?domain=zepto.com&sz=128', '.png'),
    'skyroot-aerospace': ('https://www.google.com/s2/favicons?domain=skyroot.in&sz=128', '.png'),
    'visa':         ('https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', '.svg'),
    'amgen':        ('https://upload.wikimedia.org/wikipedia/commons/a/ab/Amgen_logo.svg', '.svg'),
    'loreal':       ('https://upload.wikimedia.org/wikipedia/commons/9/9d/L%27Or%C3%A9al_logo.svg', '.svg'),
    'intuit':       ('https://upload.wikimedia.org/wikipedia/commons/4/4b/Intuit_Logo.svg', '.svg'),
    'astrazeneca':  ('https://upload.wikimedia.org/wikipedia/commons/e/ec/AstraZeneca_logo.svg', '.svg'),
    'thalesgroup':  ('https://upload.wikimedia.org/wikipedia/commons/7/7b/Thales_Logo.svg', '.svg'),
    'ovhcloud':     ('https://upload.wikimedia.org/wikipedia/commons/6/63/OVHcloud_logo.svg', '.svg'),
    'pepsico':      ('https://upload.wikimedia.org/wikipedia/commons/a/a6/PepsiCo_logo.svg', '.svg'),
    'sentry':       ('https://www.google.com/s2/favicons?domain=sentry.io&sz=128', '.png'),
    'greenhouse':   ('https://www.google.com/s2/favicons?domain=greenhouse.io&sz=128', '.png'),
    'qualcomm':     ('https://upload.wikimedia.org/wikipedia/commons/2/22/Qualcomm_logo.svg', '.svg'),
    'unilever':     ('https://upload.wikimedia.org/wikipedia/commons/8/82/Unilever_logo.svg', '.svg'),
    'breezy':       ('https://www.google.com/s2/favicons?domain=breezy.hr&sz=128', '.png'),
    'ptc':          ('https://www.google.com/s2/favicons?domain=ptc.com&sz=128', '.png'),
    'deloitte':     ('https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg', '.svg'),
    'homedepot':    ('https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg', '.svg'),
    'arm':          ('https://upload.wikimedia.org/wikipedia/commons/2/21/Arm_logo_2017.svg', '.svg'),
    'toyota':       ('https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg', '.svg'),
    'palantir':     ('https://upload.wikimedia.org/wikipedia/commons/1/13/Palantir_Technologies_logo.svg', '.svg'),
    'rolls-royce':  ('https://upload.wikimedia.org/wikipedia/commons/5/52/Rolls-Royce_Motor_Cars_logo.svg', '.svg'),
    'pwc':          ('https://upload.wikimedia.org/wikipedia/commons/0/05/PricewaterhouseCoopers_Logo.svg', '.svg'),
    'ashby':        ('https://www.google.com/s2/favicons?domain=ashbyhq.com&sz=128', '.png'),
    'ey':           ('https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg', '.svg'),
    'synopsys':     ('https://upload.wikimedia.org/wikipedia/commons/6/6c/Synopsys_Logo.svg', '.svg'),
    'boeing':       ('https://upload.wikimedia.org/wikipedia/commons/4/4f/Boeing_full_logo.svg', '.svg'),
    'zimmerbiomet': ('https://www.google.com/s2/favicons?domain=zimmerbiomet.com&sz=128', '.png'),
    'hcltech':      ('https://www.google.com/s2/favicons?domain=hcltech.com&sz=128', '.png'),
    'appliedmaterials': ('https://upload.wikimedia.org/wikipedia/commons/7/75/Applied_Materials_Logo.svg', '.svg'),
    'stryker':      ('https://upload.wikimedia.org/wikipedia/commons/4/4b/Stryker_Corporation_logo.svg', '.svg'),
    'chevron':      ('https://upload.wikimedia.org/wikipedia/commons/1/13/Chevron_Logo.svg', '.svg'),
    'lamresearch':  ('https://upload.wikimedia.org/wikipedia/commons/c/cd/Lam_Research_logo.svg', '.svg'),
    'hpe':          ('https://upload.wikimedia.org/wikipedia/commons/4/46/Hewlett_Packard_Enterprise_logo.svg', '.svg'),
}

downloaded = {}
for slug, (url, ext) in SOURCES.items():
    outpath = os.path.join(OUT_DIR, f"{slug}{ext}")
    if os.path.exists(outpath):
        print(f"SKIP {slug} (already exists)")
        downloaded[slug] = f"/logos/{slug}{ext}"
        continue
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        data = resp.read()
        with open(outpath, 'wb') as f:
            f.write(data)
        downloaded[slug] = f"/logos/{slug}{ext}"
        print(f"OK   {slug:20s} ({len(data)} bytes)")
    except Exception as e:
        print(f"FAIL {slug:20s} {e}")
        # Fallback: try Google favicons
        domain = slug.replace('-', '') + '.com'
        fallback_url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
        try:
            req2 = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
            resp2 = urllib.request.urlopen(req2, timeout=10)
            data2 = resp2.read()
            outpath2 = os.path.join(OUT_DIR, f"{slug}.png")
            with open(outpath2, 'wb') as f:
                f.write(data2)
            downloaded[slug] = f"/logos/{slug}.png"
            print(f"  -> Fallback OK ({len(data2)} bytes)")
        except Exception as e2:
            print(f"  -> Fallback also failed: {e2}")
    
    time.sleep(1.5)  # Rate limit - 1.5s between requests

print(f"\nDownloaded {len(downloaded)} logos")
print(json.dumps(downloaded, indent=2))
