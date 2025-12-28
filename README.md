# 🎤 Eurovision Scoreboard Generator

Generate beautiful Eurovision-style scoreboards with customizable themes and layouts. Perfect for fantasy Eurovision contests, music competitions, or any voting-based events.

![Scoreboard Preview](docs/preview.png)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Step 1: Prepare Your Data](#step-1-prepare-your-data)
4. [Step 2: Generate Scoreboard JSONs](#step-2-generate-scoreboard-jsons)
5. [Step 3: Use the Web App](#step-3-use-the-web-app)
6. [Voting Systems Explained](#voting-systems-explained)
7. [Themes](#themes)
8. [Layout Options](#layout-options)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This tool consists of two parts:

1. **Google Colab Script** - Converts your Excel voting data into JSON scoreboard files
2. **Web Application** - Loads the JSON files, lets you customize the look, and generates screenshot images

### What You Can Create

- Individual scoreboard images for each voting round
- Batch export of all scoreboards as a ZIP file
- Support for **Modern Eurovision** format (all points revealed at once)
- Support for **Classic Eurovision** format (jury + televote phases)

---

## Quick Start Guide

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  1. Excel File      │ ──▶ │  2. Google Colab    │ ──▶ │  3. Web App         │
│  (Your voting data) │     │  (Generate JSONs)   │     │  (Create images)    │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

---

## Step 1: Prepare Your Data

Create an Excel file (`.xlsx`) with **two sheets**:

### Sheet 1: "Countries"

List all participating countries (one per row):

| country |
|---------|
| Sweden |
| Italy |
| Ukraine |
| France |
| ... |

### Sheet 2: "Votes"

Each row represents one country's votes. The voting country is in column A, and columns B-K contain the countries they voted for (in order from 12 points to 1 point):

| Voting Country | 12pts | 10pts | 8pts | 7pts | 6pts | 5pts | 4pts | 3pts | 2pts | 1pt |
|---------------|-------|-------|------|------|------|------|------|------|------|-----|
| Poland | Sweden | Italy | France | Germany | Spain | Norway | Finland | Austria | Belgium | Ireland |
| Sweden | Ukraine | Italy | France | Poland | Spain | Germany | Norway | Finland | Austria | Belgium |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Example Excel Structure

```
voting_data.xlsx
├── Sheet: Countries
│   └── Column A: country names
└── Sheet: Votes
    ├── Column A: Voting Country
    ├── Column B: 12 points recipient
    ├── Column C: 10 points recipient
    ├── Column D: 8 points recipient
    ├── Column E: 7 points recipient
    ├── Column F: 6 points recipient
    ├── Column G: 5 points recipient
    ├── Column H: 4 points recipient
    ├── Column I: 3 points recipient
    ├── Column J: 2 points recipient
    └── Column K: 1 point recipient
```

---

## Step 2: Generate Scoreboard JSONs

### Open Google Colab

1. Go to [Google Colab](https://colab.research.google.com/)
2. Create a new notebook or open the provided notebook link
3. Copy and paste the Python script (provided below)
4. Run the script

### The Python Script

Copy this entire script into a Colab cell and run it:

```python
import json
import zipfile
import pandas as pd
from google.colab import files

print("Please upload your voting_data.xlsx file:")
uploaded = files.upload()
excel_file = list(uploaded.keys())[0]

def generate_modern_scoreboards(excel_file):
    """Generate scoreboards for modern Eurovision system (all points shown at once)"""
    df_votes = pd.read_excel(excel_file, sheet_name='Votes')
    df_countries = pd.read_excel(excel_file, sheet_name='Countries')

    participating_countries = df_countries['country'].tolist()
    scoreboards = {}
    cumulative_scores = {country: 0 for country in participating_countries}

    for idx, row in df_votes.iterrows():
        voter_count = idx + 1
        voting_country = str(row['Voting Country']).strip()

        points_distribution = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1]
        voted_countries = [str(country).strip() for country in row.iloc[1:11].tolist() if pd.notna(country)]

        for i, country in enumerate(voted_countries):
            if country in cumulative_scores:
                cumulative_scores[country] += points_distribution[i]

        scoreboard = []
        for country in participating_countries:
            points_gained = str(
                points_distribution[voted_countries.index(country)]) if country in voted_countries else "0"
            scoreboard.append({
                "country": country,
                "placement": "",
                "pointsOverall": str(cumulative_scores[country]),
                "pointsGained": points_gained,
                "isVoter": "1" if country == voting_country else "0"
            })

        sorted_scoreboard = sorted(scoreboard, key=lambda x: int(x['pointsOverall']), reverse=True)

        for place_idx, entry in enumerate(sorted_scoreboard, start=1):
            entry['placement'] = str(place_idx)

        scoreboards[voter_count] = sorted_scoreboard

    return scoreboards


def generate_classic_scoreboards(excel_file):
    """
    Generate scoreboards for classic Eurovision system:
    - Phase 1 (Jury): Each voter reveals points 1, 3, 5, 7
    - Phase 2 (Televote): Reveal from last place to first, showing sum of 2, 4, 6, 8, 10, 12
    """
    df_votes = pd.read_excel(excel_file, sheet_name='Votes')
    df_countries = pd.read_excel(excel_file, sheet_name='Countries')

    participating_countries = df_countries['country'].tolist()
    
    all_points_distribution = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1]
    jury_point_indices = [3, 5, 7, 9]  # Indices for 7, 5, 3, 1 points
    televote_point_indices = [0, 1, 2, 4, 6, 8]  # Indices for 12, 10, 8, 6, 4, 2 points

    jury_scoreboards = {}
    cumulative_jury_scores = {country: 0 for country in participating_countries}

    # Phase 1: Jury voting (only 1, 3, 5, 7 points)
    for idx, row in df_votes.iterrows():
        voter_count = idx + 1
        voting_country = str(row['Voting Country']).strip()
        voted_countries = [str(country).strip() for country in row.iloc[1:11].tolist() if pd.notna(country)]

        for i in jury_point_indices:
            if i < len(voted_countries):
                country = voted_countries[i]
                if country in cumulative_jury_scores:
                    cumulative_jury_scores[country] += all_points_distribution[i]

        scoreboard = []
        for country in participating_countries:
            points_gained = "0"
            if country in voted_countries:
                country_idx = voted_countries.index(country)
                if country_idx in jury_point_indices:
                    points_gained = str(all_points_distribution[country_idx])

            scoreboard.append({
                "country": country,
                "placement": "",
                "pointsOverall": str(cumulative_jury_scores[country]),
                "pointsGained": points_gained,
                "isVoter": "1" if country == voting_country else "0"
            })

        sorted_scoreboard = sorted(scoreboard, key=lambda x: int(x['pointsOverall']), reverse=True)
        for place_idx, entry in enumerate(sorted_scoreboard, start=1):
            entry['placement'] = str(place_idx)

        jury_scoreboards[f"jury_{voter_count}"] = sorted_scoreboard

    # Calculate televote sums for each country
    televote_sums = {country: 0 for country in participating_countries}
    
    for idx, row in df_votes.iterrows():
        voted_countries = [str(country).strip() for country in row.iloc[1:11].tolist() if pd.notna(country)]
        
        for i in televote_point_indices:
            if i < len(voted_countries):
                country = voted_countries[i]
                if country in televote_sums:
                    televote_sums[country] += all_points_distribution[i]

    # Get final jury standings for reveal order
    last_jury = jury_scoreboards[f"jury_{len(df_votes)}"]
    reveal_order = sorted(last_jury, key=lambda x: int(x['placement']), reverse=True)
    reveal_order_countries = [entry['country'] for entry in reveal_order]

    # Phase 2: Televote reveal (from last place to first)
    televote_scoreboards = {}
    cumulative_scores = {entry['country']: int(entry['pointsOverall']) for entry in last_jury}

    for reveal_idx, revealing_country in enumerate(reveal_order_countries):
        televote_count = reveal_idx + 1
        
        cumulative_scores[revealing_country] += televote_sums[revealing_country]

        scoreboard = []
        for country in participating_countries:
            points_gained = "0"
            if country == revealing_country:
                points_gained = str(televote_sums[country])

            scoreboard.append({
                "country": country,
                "placement": "",
                "pointsOverall": str(cumulative_scores[country]),
                "pointsGained": points_gained,
                "isVoter": "1" if country == revealing_country else "0"
            })

        sorted_scoreboard = sorted(scoreboard, key=lambda x: int(x['pointsOverall']), reverse=True)
        for place_idx, entry in enumerate(sorted_scoreboard, start=1):
            entry['placement'] = str(place_idx)

        televote_scoreboards[f"televote_{televote_count}"] = sorted_scoreboard

    return jury_scoreboards, televote_scoreboards


def main():
    print("\nSelect voting system:")
    print("1. Modern Eurovision (all points 1-12 shown per voter)")
    print("2. Classic Eurovision (Jury: 1,3,5,7 then Televote: 2,4,6,8,10,12 reveal)")
    print("3. Both systems")
    
    choice = input("\nEnter choice (1/2/3): ").strip()

    if choice == "1":
        scoreboards = generate_modern_scoreboards(excel_file)
        zip_filename = "scoreboards_modern.zip"
        
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for voter_num, scoreboard in scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"scoreboard{voter_num}.json", json_content)
            
            combined_content = json.dumps(scoreboards, indent=4, ensure_ascii=False)
            zipf.writestr("scoreboards_combined.json", combined_content)
        
        print(f"\nCreated {zip_filename} with {len(scoreboards)} JSON files")
        files.download(zip_filename)

    elif choice == "2":
        jury_scoreboards, televote_scoreboards = generate_classic_scoreboards(excel_file)
        zip_filename = "scoreboards_classic.zip"
        
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for key, scoreboard in jury_scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"{key}.json", json_content)
            
            for key, scoreboard in televote_scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"{key}.json", json_content)
            
            combined = {
                "jury": jury_scoreboards,
                "televote": televote_scoreboards
            }
            combined_content = json.dumps(combined, indent=4, ensure_ascii=False)
            zipf.writestr("scoreboards_combined.json", combined_content)
        
        total_files = len(jury_scoreboards) + len(televote_scoreboards)
        print(f"\nCreated {zip_filename} with {total_files} JSON files")
        print(f"  - {len(jury_scoreboards)} jury scoreboards")
        print(f"  - {len(televote_scoreboards)} televote scoreboards")
        files.download(zip_filename)

    elif choice == "3":
        modern_scoreboards = generate_modern_scoreboards(excel_file)
        jury_scoreboards, televote_scoreboards = generate_classic_scoreboards(excel_file)
        
        zip_filename = "scoreboards_all.zip"
        
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for voter_num, scoreboard in modern_scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"modern/scoreboard{voter_num}.json", json_content)
            
            modern_combined = json.dumps(modern_scoreboards, indent=4, ensure_ascii=False)
            zipf.writestr("modern/scoreboards_combined.json", modern_combined)
            
            for key, scoreboard in jury_scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"classic/{key}.json", json_content)
            
            for key, scoreboard in televote_scoreboards.items():
                json_content = json.dumps(scoreboard, indent=4, ensure_ascii=False)
                zipf.writestr(f"classic/{key}.json", json_content)
            
            classic_combined = {
                "jury": jury_scoreboards,
                "televote": televote_scoreboards
            }
            classic_combined_content = json.dumps(classic_combined, indent=4, ensure_ascii=False)
            zipf.writestr("classic/scoreboards_combined.json", classic_combined_content)
        
        print(f"\nCreated {zip_filename}")
        print(f"  Modern: {len(modern_scoreboards)} scoreboards")
        print(f"  Classic: {len(jury_scoreboards)} jury + {len(televote_scoreboards)} televote scoreboards")
        files.download(zip_filename)

    else:
        print("Invalid choice. Please run again.")

main()
```

### Running the Script

1. **Run the cell** (click the play button or press `Ctrl+Enter`)
2. **Upload your Excel file** when prompted
3. **Choose voting system**:
   - Enter `1` for Modern Eurovision
   - Enter `2` for Classic Eurovision
   - Enter `3` for Both
4. **Download the ZIP file** that is automatically generated

### What You Get

**Modern Eurovision (Option 1):**
```
scoreboards_modern.zip
├── scoreboard1.json
├── scoreboard2.json
├── ...
└── scoreboards_combined.json
```

**Classic Eurovision (Option 2):**
```
scoreboards_classic.zip
├── jury_1.json
├── jury_2.json
├── ...
├── televote_1.json
├── televote_2.json
├── ...
└── scoreboards_combined.json
```

---

## Step 3: Use the Web App

### Opening the App

1. Go to the web application URL (provided separately)
2. You'll see the Scoreboard Generator interface

### Uploading Your Data

1. Find the **"Batch Upload"** section
2. Choose one of two options:
   - **Combined JSON file**: Upload the `scoreboards_combined.json` file
   - **Multiple JSON files**: Select all individual JSON files at once

3. The app will show how many scoreboards were loaded

### Selecting Voting System

1. In the **"Voting System"** section, choose:
   - **Modern Eurovision** - for standard scoreboard files
   - **Classic Eurovision** - for jury + televote phase files

### Customizing the Look

#### Theme Selection

Choose from available themes:
- **Retro** - Classic minimalist style with Abril fonts
- **Windows 98** - Nostalgic retro computer aesthetic
- **Eurovision** - Broadcast-style with gradients
- **Neon** - Cyberpunk with glowing effects
- **Minimal** - Clean, modern design
- **Dark** - Dark mode theme

#### Layout Options

- **Row Style**:
  - `Default` - Flag, Country Name, Points Overall, Points Gained
  - `Compact` - Points Overall, Country Name, Points Gained (no flags)

- **Show Flags**: Toggle country flags on/off

- **Show Voter Panel**: Toggle the side panel showing:
  - Current voting/revealing country name
  - Country images (if available)
  - Vote counter (e.g., "5 / 26")

- **Panel Position**: Left or Right side

### Previewing Scoreboards

1. Use the **dropdown selectors** to choose:
   - Phase (for Classic: Jury or Televote)
   - Specific scoreboard number

2. The preview updates automatically

### Generating Screenshots

1. Click **"Generate & Download ZIP"** button
2. Wait for the progress bar to complete
3. A ZIP file with all scoreboard images will download automatically

The ZIP contains PNG images named:
- Modern: `1.png`, `2.png`, etc.
- Classic: `jury_1.png`, `jury_2.png`, `televote_1.png`, `televote_2.png`, etc.

---

## Voting Systems Explained

### Modern Eurovision System

Used in Eurovision since 2016. Each voting country reveals all their points at once:

| Points | Position |
|--------|----------|
| 12 | 1st place |
| 10 | 2nd place |
| 8 | 3rd place |
| 7 | 4th place |
| 6 | 5th place |
| 5 | 6th place |
| 4 | 7th place |
| 3 | 8th place |
| 2 | 9th place |
| 1 | 10th place |

**Scoreboard flow**: Country 1 votes → Country 2 votes → ... → Final results

### Classic Eurovision System

Used in older Eurovision broadcasts. Points are split into two phases:

#### Phase 1: Jury Vote
Each voting country reveals only these points:
- 7 points (4th place)
- 5 points (6th place)  
- 3 points (8th place)
- 1 point (10th place)

#### Phase 2: Televote Reveal
After all jury votes, reveal televote points from **last place to first**:

Each country receives their **total televote sum** (combined 12, 10, 8, 6, 4, 2 points from all voters)

**Example**:
1. Albania (26th place) receives 52 televote points total
2. Poland (25th place) receives 74 televote points total
3. ... continuing to 1st place

---

## Themes

### Retro Theme
- Background: Beige (#eae1d3)
- Clean black borders and text
- Red circular points bubbles
- Fonts: Abril Display, Above The Beyond Script

### Windows 98 Theme
- Nostalgic computer aesthetic
- Window frame background
- Teal country name boxes
- Yellow/gold highlights

### Other Themes
Each theme customizes:
- Colors (background, text, accents)
- Fonts
- Border styles
- Effects (glow, shadows)

---

## Layout Options

### Default Row Layout
```
┌──────┬─────────────────┬──────┬──────┐
│ 🇸🇪  │ Sweden          │  247 │  12  │
└──────┴─────────────────┴──────┴──────┘
  Flag    Country Name    Total  Gained
```

### Compact Row Layout
```
┌──────┬─────────────────┬──────┐
│  247 │ Sweden          │  12  │
└──────┴─────────────────┴──────┘
 Total   Country Name    Gained
```

### With Voter Panel
```
┌─────────────┬────────────────────────────────────┐
│             │                                    │
│   Poland    │     ┌─────────────────────────┐   │
│             │     │      SCOREBOARD         │   │
│ Now Voting  │     │                         │   │
│             │     │  Sweden........247  12  │   │
│   [Image]   │     │  Italy.........231  10  │   │
│             │     │  Ukraine.......218   8  │   │
│   5 / 26    │     │  ...                    │   │
│             │     └─────────────────────────┘   │
└─────────────┴────────────────────────────────────┘
```

---

## Troubleshooting

### Common Issues

#### "No scoreboards loaded"
- Make sure you uploaded the correct JSON file format
- Check that the file isn't empty
- Try the combined JSON file instead of individual files

#### "Invalid format" error when uploading
- Ensure your JSON files are properly formatted
- The combined file should have numbered keys (`"1"`, `"2"`, etc.) or phase prefixes (`"jury_1"`, `"televote_1"`)

#### Scoreboards look wrong
- Check that you selected the correct voting system (Modern vs Classic)
- Verify your Excel data has the correct column structure

#### Images not showing in voter panel
- Place country images in the correct folders:
  - `/public/voters_images/COUNTRY_NAME.png`
  - `/public/artists_images/COUNTRY_NAME.png`
- Country names must be UPPERCASE and match exactly

#### Flags not showing
- Place flag images in `/public/flags/COUNTRY_NAME.png`
- Country names must be UPPERCASE
- Supported formats: PNG, JPG, JPEG, WebP, GIF

### Excel File Issues

#### "KeyError: 'Votes'" or "KeyError: 'Countries'"
- Make sure your Excel file has sheets named exactly `Votes` and `Countries`
- Sheet names are case-sensitive

#### Missing countries in output
- Check that all country names in the Votes sheet match exactly with the Countries sheet
- Watch for extra spaces or different capitalization

### Getting Help

If you encounter issues not covered here:
1. Check that your Excel file follows the exact format described
2. Verify all country names are consistent
3. Try generating with a smaller test dataset first

---

## File Requirements Summary

### Images (Optional)

Place in `public/` folder:

| Folder | Purpose | Naming |
|--------|---------|--------|
| `/flags/` | Country flags | `SWEDEN.png`, `UNITED KINGDOM.png` |
| `/voters_images/` | Voter photos | `SWEDEN.png`, `UNITED KINGDOM.png` |
| `/artists_images/` | Artist photos | `SWEDEN.png`, `UNITED KINGDOM.png` |

### Supported Image Formats
- PNG (recommended)
- JPG / JPEG
- WebP
- GIF

---

## Credits

Built with:
- React + TypeScript
- html2canvas for screenshots
- JSZip for ZIP generation
- Python + Pandas for data processing

---

**Happy scoreboard generating! 🎉**
