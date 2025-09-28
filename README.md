# Hospital Management System

A comprehensive Hospital Management System built on Salesforce Platform with a web interface.

## Features

- Patient Management
- Doctor Management
- Appointment Scheduling
- Medical Records Management
- User-friendly Interface
- Responsive Design

## Technology Stack

- Salesforce Platform
- Lightning Web Components (LWC)
- HTML5/CSS3
- Salesforce Lightning Design System (SLDS)

## Installation

1. Clone this repository
2. Deploy to Salesforce org using SFDX:
   ```bash
   sfdx force:source:deploy -p force-app -u your-org@example.com
   ```
3. Assign permission sets to users:
   ```bash
   sfdx force:user:permset:assign -n Hospital_Management_User -u your-org@example.com
   ```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   cd web
   python -m http.server 8080
   ```
3. Access the web interface at `http://localhost:8080`

## Structure

- `/force-app` - Salesforce metadata
- `/web` - Web interface files
- `/scripts` - Utility scripts
- `/config` - Configuration files

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request