# Tegara Business Management — Micro-ERP & Store Management System

Tijara is a comprehensive, micro-ERP style web application designed for small to medium-sized retail businesses (such as groceries, workshops, cafes, and clothing stores). The system aims to simplify daily operations, track inventory, manage debts, and monitor profits through a modern, eye-friendly dark mode interface that is fully responsive and print-ready.

---

## Key Features

* **Smart Dashboard:** Displays daily revenue and profits, current warehouse stock value, and total outstanding debts, along with a 7-day sales chart and a quick history log.
* **Daily Sales Management:** A flexible interface to input daily sold quantities, with instant, automatic calculations for revenue, cost, and net profit per item and for the entire day before saving.
* **Smart Storage Tracking:** A complete inventory system tracking purchase/selling prices and available quantities, featuring color-coded alerts (critical/low stock) when an item reaches its minimum limit.
* **Debts & Credit System:** Manages customer credit accounts, including customer names, purchased goods, and due dates, with support for partial or full payments and overdue debt badges.
* **Expense Management:** Records operational expenses (rent, electricity, water, salaries) and links them to monthly net profits for accurate final bottom-line tracking.
* **Supplier & Shipment Log:** Tracks incoming shipments from suppliers and automatically updates warehouse stock levels upon arrival.
* **Print-Ready Reports (Print & PDF):** A dedicated daily report page summarizing financial performance and alerts, optimized with `@media print` to instantly transform into a clean, print-friendly white layout or save as a PDF.
* **Account & Notification Settings:** Allows business data customization, inventory/debt threshold adjustments, and data export via CSV (Excel) or JSON backups.

---

## Tech Stack

* **Frontend:** Built with **React**, leveraging a component-based architecture for a fast, dynamic, and seamless Single Page Application (SPA) experience.
* **Backend:** Powered by **Xano**, serving as a robust, scalable, and secure No-Code backend API that handles the database, business logic, and real-time data persistence.
* **Styling:** Modern UI designed completely from scratch using custom CSS variables, Flexbox/Grid systems, custom animations, and full mobile-first responsiveness.

---

## Code Structure

The project is structured as a single-page application (SPA) with highly organized code sections for easy maintenance:
* **LAYOUT & SIDEBAR:** Handlers for the sidebar navigation and UI views.
* **METRIC & CARDS:** Elements displaying real-time business statistics and counters.
* **MODALS & TOASTS:** Pop-ups for adding/editing data and instant action confirmation notifications.
* **STATE:** A centralized JavaScript state object that stores initial data and handles core business logic functions.
