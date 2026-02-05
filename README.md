# Inventory Management System

A full-stack Inventory Management application designed to manage stock, products, and sales efficiently. This project utilizes a **Django** backend and a **React (TypeScript)** frontend.

---

## 📂 Project Structure

This repository contains:
* **`inventory/`**: The Backend API built with Django and Django REST Framework.
* **`inventory-ui/`**: The Frontend web application built with React, TypeScript, and Vite.

---

## 🛠️ Tech Stack

### Backend
* **Python & Django**: Robust backend framework.
* **Django REST Framework**: For building powerful APIs.
* **SQLite**: Default database for development.

### Frontend
* **React.js**: Modern UI library.
* **TypeScript**: For type-safe development.
* **Tailwind CSS**: For responsive and modern styling.

---

## 🚀 Installation & Setup

### 1. Backend (Django)
```bash
cd inventory
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
