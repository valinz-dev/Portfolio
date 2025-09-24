# Get a list of folders and their associated metadata.



# Force PowerShell to use TLS 1.2 instead of default TLS 1.0
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Set the Content-Type to application/x-www-form-urlencoded
$header = @{
    "Accept" = "*/*";
    "Content-Type" = "application/x-www-form-urlencoded"
}
write-host '-------LOGIN INFORMATION-------

'
# For URLs like 'imanage.work' use the format 'xxxxx-mobility.imanage.work'.
# For URLs like 'cloudimanage.com use 'cloudimanage.com' or the vanity code variant specified in Control Center.
$server = 'cloudimanage.com'

# Store the library ID in a variable.
$library =  'imanage'

# Store the input variables for signing in.
# For URLs like 'imanage.work', the account must be virutal and in the NRTADMIN group. Use the 'User ID' found in Control Center.
# For URLs like 'cloudimanage.com', the account must be virtual and in the NRTADMIN group. Use the 'email' found in Control Center.
$username =  'imanadmin@mcdowellrice.com'
$securedValue = Read-Host -Prompt 'Password' -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securedValue)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
# For URLs like 'imanage.work', the client id and secret can be found in the associated Control Center application.
# For URLs like 'cloudimanage.com' reach out to iManage Support to recieve your client id and secret.
$client_id =  'reporting_tool'
$client_secret =  'xxxxx'
write-host '

-------SEARCH CRITERIA-------

'
# Check API documentation for valid search filters under "query string parameters" for the endpoint GET https://$server/api/v2/customers/$customer_id/libraries/$library/folders
# https://help.imanage.com/hc/en-us/articles/4412558535067-iManage-Work-Universal-API-Reference-Guide-REST-v2-#get-/work/api/v2/customers/-customerId-/libraries/-libraryId-/folders

# Enter metadata you want to filter on. Example: 'owner'. Leave blank if searching for all folders.
$metadata = ''

# Enter metadata value you want to filter on. Example: 'JSMITH'. Leave blank if searching for all folders.
$metavalue =  ''

write-host '

-------DATA FILE-------

'
# Enter the full path for the output location of the datafile.
$datafile =  'C:\imanoutput\FolderList.csv'

function SignIn {
    try {
        # Create object which is used as a payload to pass the user ID and password.
        # Requires Work Server 10.2.2 and later.
        $parameters = @{
            "username"  = $username;
            "password" = $password;
            "grant_type" = "password";
            "client_id" = $client_id;
            "client_secret" = $client_secret;
            "scope" = "admin";
        }

        # Send the 'POST' request to the server and store the response in a variable.
        $response = Invoke-RestMethod -Method Post -Uri "https://$server/auth/oauth2/token" -Header $header -Body $parameters

        # Retrieve the authorization token if present.
        # This token is required to be passed in future API requests.
        $x_auth_token = $response.$("access_token")

        return $x_auth_token
    }
    catch {
        Write-Host -Message "Sign in unsuccessful, exiting"

        if ($_.Exception.Response)
        {
            # HTTP error response (server response)
            Write-Host -Message "$($_.Exception.Response.StatusCode.value__)- $($_.Exception.Response.StatusDescription)"
        }
        else
        {
            # Other exceptions (e.g., unable to locate remote server)
            Write-Host -Message "$($_.ToString())"
        }

        exit
    }
}

function SignOut {
    try {
        $response = Invoke-RestMethod -Method Get -Uri "https://$server/login/terminate" -Header $header
        Write-Host -Message "Sign out successful"
    }
    catch {
        Write-Host -Message "Sign out unsuccessful, exiting"

        if ($_.Exception.Response)
        {
            # HTTP error response (server response)
            Write-Host -Message "$($_.Exception.Response.StatusCode.value__)- $($_.Exception.Response.StatusDescription)"
        }
        else
        {
            # Other exceptions (e.g., unable to locate remote server)
            Write-Host -Message "$($_.ToString())"
        }

        exit
    }
}

function GetCustomerID {
    try {
        $response = Invoke-RestMethod -Method Get -Uri "https://$server/api" -Header $header
        $customerId = $response.data.user.customer_id

        return $customerId
    }
    catch {
        Write-Host -Message "API call unsuccessful, exiting"

        if ($_.Exception.Response)
        {
            # HTTP error response (server response)
            Write-Host -Message "$($_.Exception.Response.StatusCode.value__)- $($_.Exception.Response.StatusDescription)"
        }
        else
        {
            # Other exceptions (e.g., unable to locate remote server)
            Write-Host -Message "$($_.ToString())"
        }

        exit
    }
}

function GetDocument {
    [CmdletBinding()]
    param(
	    [Parameter(Mandatory=$true)]
		[string]
		$resource
	)

    # Document search scope
    If ($customer_id -eq "1"){
	$parameters = @{
		$metadata = $metavalue;
		"limit" = 5000;
		"cursor" = "";
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}}
    else {
    $parameters = @{
		$metadata = $metavalue;
		"limit" = 5000;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}    }
        # Create header
        "Name`tFolder ID`tOwner`tEdit Date`tDefault Security`tFolder Type`tHas Documents`tHas Subfolders`tParent ID`tWorkspace ID`tWorkspace Name” | out-file $datafile -append

    $response = Invoke-RestMethod -Method Get -Uri $resource -Header $header -Body $parameters

    # While there is data in the responce
    while ($response.data) {
        # Grabbing the intial cursor
        If ($customer_id -eq "1") {
        If ($null -ne $response.cursor) {
            $parameters["cursor"] = $response.cursor
		}
        else {
            Break
		}                         }

        else {
        If ($null -ne $response.cursor) {
           $parameters = @{
		$metadata = $metavalue;
		"limit" = 5000;
		"cursor" = $response.cursor;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}
		}
        else {
            Break
		}      
                                        }
        # Loop through all results in Cursor
		$response.data | ForEach-Object {
		    # Default Values that will show if no data is sent.
            $name = $_.name
			$doc_id = $_.id
			$owner = $_.owner
			$editdate = $_.edit_date
			$Dsecurity = $_.default_security
			$folder_type = if ($null -ne $_.folder_type) { $_.folder_type } else { "share" }
            $has_documents = $_.has_documents
			$has_subfolders = $_.has_subfolders
            $parent_id = $_.parent_id
			$workspace_id = $_.workspace_id
            $workspace_name = $_.workspace_name

            $outString = "$name`t$doc_id`t$owner`t$editdate`t$Dsecurity`t$folder_type`t$has_documents`t$has_subfolders`t$parent_id`t$workspace_id`t$workspace_name"
            #Write-host $outString
            $outString | Out-File $datafile -Append
         # $response | ConvertTo-Json
        #  Write-host $response
		}

        # Updating the Cursor, so the loop can start over.
        $response = Invoke-RestMethod -Method Get -Uri $resource -Header $header -Body $parameters
    }
}

function Main {
    $XAuthToken = SignIn
    $header["X-Auth-Token"] = $XAuthToken
    $header["Content-Type"] = "application/json"
    $customer_id = GetCustomerID
	$resource = "https://$server/api/v2/customers/$customer_id/libraries/$library/folders"

    Write-Host -Message "Getting list of folders"
    GetDocument($resource)
    Write-Host -Message "Folder list complete for $library database. List output to $datafile"

    SignOut
}

Main