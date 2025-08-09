# Requisition Dashboard

A comprehensive dashboard for managing Google Form requisitions with team-based authentication and status tracking.

## Features

- **Dual Authentication System**:
  - Google OAuth for Managers
  - Email/Password for Team Members
- **Real-time Google Sheets Integration**
- **Date-wise Filtering**
- **Role-based Access Control**
- **Team Management**
- **Status Tracking** (Updates column CE in Google Sheets)

## Setup Instructions

### 1. Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local`
4. Update environment variables with your Google credentials
5. Run development server: `npm run dev`

### 2. Environment Variables

\`\`\`env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SHEETS_API_KEY=your_sheets_api_key
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
TEAM_MEMBERS_DATA=your_team_members_json
MANAGERS_DATA=your_managers_json
\`\`\`

### 3. Team Member Management

**Default Team Members** (Password: `password123`):
- alice@company.com - Content Development
- bob@company.com - Content Development  
- carol@company.com - Design Team
- david@company.com - Design Team

**Manager**: manager@company.com (Google OAuth)

### 4. Google Sheets Setup

1. Add a "Status" column in column CE of your Google Sheet
2. Enable Google Sheets API in Google Cloud Console
3. Create OAuth2 credentials
4. Add your domain to authorized origins
5. If your sheet is private, create a Service Account and share the sheet with the service account email as a Reader/Editor

### Private Sheets via Service Account (recommended)

To avoid 403 PERMISSION_DENIED errors when the sheet is not public:

1. In Google Cloud Console, create a Service Account with the Sheets API enabled
2. Download its JSON credentials
3. Add an environment variable `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` containing the entire JSON on a single line. Newlines in `private_key` can remain escaped (\n). Example:

```env
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"your-sa@project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

4. Share the Google Sheet with the `client_email` from the JSON. Grant Viewer for read-only, Editor to allow status updates.
5. Restart the dev server after changing env vars.

## Deployment

### GitHub Integration

1. Create a new repository on GitHub
2. Push your code:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/requisition-dashboard.git
   git push -u origin main
   \`\`\`

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Customization Points

### Adding Team Members
- **Via Dashboard**: Managers can add team members through the Team Management tab
- **Via Environment**: Update `TEAM_MEMBERS_DATA` environment variable
- **Via Database**: Replace the JSON storage with a proper database

### Updating Google Sheets Columns
- Modify `lib/google-sheets-integration.ts`
- Update column references (currently using CE for status)
- Adjust field mappings in `getRequisitions()` method

### Authentication
- **Team Members**: Email/password stored in environment variables
- **Managers**: Google OAuth integration
- **Production**: Replace with proper database and password hashing

## Production Considerations

1. **Database**: Replace JSON storage with PostgreSQL/MongoDB
2. **Password Security**: Hash passwords using bcrypt
3. **Session Management**: Use proper session storage
4. **Error Handling**: Add comprehensive error handling
5. **Logging**: Implement proper logging system
6. **Rate Limiting**: Add API rate limiting
7. **HTTPS**: Ensure HTTPS in production
