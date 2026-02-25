# Load .env file into environment variables, then run sonar scanner
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}
Write-Host "SONAR_TOKEN loaded from .env"
sonar @args
