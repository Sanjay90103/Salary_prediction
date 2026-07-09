# Employee Salary Prediction System

A realistic, clean, and interactive Full Stack Python web application that predicts employee salaries based on demographic and professional attributes using machine learning.

This project is structured as a professional portfolio/college project. It avoids over-engineering and is designed to be readable, maintainable, and interview-friendly.

---

## 📁 Project Structure

```text
salary-prediction-system/
│
├── data/
│   └── employee_salaries.csv        # Generated dataset used for training
│
├── models/
│   └── salary_model.pkl             # Trained Scikit-learn pipeline (joblib)
│
├── scripts/
│   └── train_model.py               # Dataset generation and model training script
│
├── static/
│   ├── css/
│   │   └── style.css                # Custom CSS styling (indigo & teal design system)
│   └── js/
│       └── main.js                  # Frontend validations and AJAX API caller
│
├── templates/
│   ├── base.html                    # Base UI layout
│   ├── index.html                   # Home introduction page
│   └── predict.html                 # Prediction forms and interactive results
│
├── app.py                           # Flask backend server
├── requirements.txt                 # Project dependencies
└── README.md                        # Setup and run instructions
```

---

## 🛠️ Features

- **End-to-End Machine Learning Pipeline**: Features are scaled and encoded inside a unified `scikit-learn` pipeline. This encapsulates the logic, prevents data leakage during training, and guarantees matching preprocessing steps during live API inference.
- **Random Forest Regression**: Leverages a robust ensemble model trained on synthetic, logically structured salary data points.
- **Double-Layer Validation**:
  - *Client-side*: Real-time verification of name length, value boundaries (e.g., ages between 21 and 65), and logical checks (e.g., years of experience cannot exceed age minus 18).
  - *Backend*: Robust server-side schema verification returning descriptive error states if invalid data bypasses the client.
- **Asynchronous Flow**: Uses JavaScript's `fetch` API for submitting form data, animating spinners, and displaying predictions without page reloads.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Install all required libraries using `pip`:
```bash
pip install -r requirements.txt
```

### 2. Generate Dataset & Train Model
Execute the training script. This script generates a synthetic dataset containing realistic salary variations based on age, role multipliers, experience increments, and educational levels. It will train the model and save the serialized pipeline:
```bash
python scripts/train_model.py
```
After completion, verify that:
- `data/employee_salaries.csv` is populated.
- `models/salary_model.pkl` is created.

### 3. Start the Web Server
Launch the Flask development server:
```bash
python app.py
```
Open your web browser and navigate to:
[http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📊 Machine Learning Model Logic

Salary predictions are modeled around these realistic salary trends:
* **Base Salary**: $40,000
* **Job Role Multipliers**: Software Engineer (1.4x), Data Scientist (1.5x), Product Manager (1.45x), Analyst (1.0x), Designer (1.15x)
* **Education level bonus**: Bachelor's ($0), Master's ($15,000), PhD ($35,000)
* **Experience bonus**: Linear experience factor with a minor diminishing return factor for high tenures
* **Age bonus**: Small maturity bump per year above age 21
* **Noise**: Realistic variance represented via standard Gaussian distribution ($\sigma = \$5000$)
