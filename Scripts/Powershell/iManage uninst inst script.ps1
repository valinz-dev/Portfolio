# Function to uninstall old iManage version
function Uninstall-iManage {
    param (
        [string]$oldVersionPath
    )

    try {
        # Filter the software by name
        $app = Get-WmiObject -Class Win32_Product | Where-Object { $_.Name -match "iManage" }

        # Check if the software was found
        if ($app -ne $null) {
            # Uninstall the software
            $app.Uninstall()
            Write-Host "Uninstallation of $($app.Name) completed."
        } else {
            Write-Host "Software 'iManage' not found."
        }
    }
    catch {
        Write-Host "Error uninstalling old version of iManage: $_"
    }
}

# Function to install new version of iManage
function Install-iManage {
    param (
        [string]$newVersionPath
    )

    try {
        $installCmd = "Start-Process `"$newVersionPath`" -ArgumentList /silent -Wait"
        Invoke-Expression $installCmd
        Write-Host "Installation of new version of iManage completed successfully."
    }
    catch {
        Write-Host "Error installing new version of iManage: $_"
    }
}

# Main script
$oldVersionPath = "\\fs1\install\Program_Installs\iManage Autonomy\FileSite 9.3.6.807 (x86)\iManage Work FileSite (x86).msi"
$newVersionPath = "\\fs1\install\Program_Installs\iManage Autonomy\iManage Installer 10.9.3.2\iManageInstaller.exe"

# Uninstall old version of iManage using WMI
Uninstall-iManage -oldVersionPath $oldVersionPath

# Install new version of iManage
Install-iManage -newVersionPath $newVersionPath
