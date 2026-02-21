$HostName = "72.60.199.129"
$User = "root"

Write-Host "--- Step 1: Creating Deployment Archive ---" -ForegroundColor Cyan
# Tar command available in Windows 10+ (BSD tar)
# Exclude node_modules, .next, .git, .env
tar -czf deploy.tar.gz --exclude node_modules --exclude .next --exclude .git --exclude .env .

if (-not (Test-Path "deploy.tar.gz")) {
    Write-Error "Failed to create deploy.tar.gz"
    exit 1
}

Write-Host "--- Step 2: Uploading Files to VPS ---" -ForegroundColor Cyan
Write-Host "Note: You may be prompted for the SSH password." -ForegroundColor Yellow

# Upload Archive
scp deploy.tar.gz "${User}@${HostName}:/tmp/"
# Upload Helper Script
scp deploy/setup_remote.sh "${User}@${HostName}:/tmp/"
# Upload Nginx Config
scp deploy/nginx.conf "${User}@${HostName}:/tmp/"

Write-Host "--- Step 3: Executing Remote Setup ---" -ForegroundColor Cyan
ssh "${User}@${HostName}" "chmod +x /tmp/setup_remote.sh && bash /tmp/setup_remote.sh"

Write-Host "--- Step 4: Cleanup Local ---" -ForegroundColor Cyan
Remove-Item deploy.tar.gz

Write-Host "Done! Visit http://${HostName}" -ForegroundColor Green
