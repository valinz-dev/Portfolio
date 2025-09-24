# Get a list of documents and their associated metadata.



# Force PowerShell to use TLS 1.2 instead of default TLS 1.0
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Set the Content-Type to application/x-www-form-urlencoded
$header = @{
    "Accept" = "*/*";
    "Content-Type" = "application/x-www-form-urlencoded"
}
write-host '-------LOGIN INFORMATION-------

'
# For hostnames like 'imanage.work' use the format 'xxxxx-mobility.imanage.work'.
# For hostnames like 'cloudimanage.com use 'cloudimanage.com' or the vanity code variant specified in Control Center.
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
$client_secret =  ''

# Check API documentation for valid search filters under "query string parameters" for the endpoint GET https://$server/api/v2/customers/$customer_id/libraries/$library/documents
# https://help.imanage.com/hc/en-us/articles/4412558535067-iManage-Work-Universal-API-Reference-Guide-REST-v2-#get-/work/api/v2/customers/-customerId-/libraries/-libraryId-/documents

# Enter metadata you want to filter on. Example: 'author'. Leave blank if searching for all documents.
$metadata1 = 'container_id'
# Enter metadata value you want to filter on. Example: 'JSMITH'. Leave blank if searching for all documents
$metavalue1 =  'IMANAGE!3856283'


# An additional metadata filter. Example: 'custom2'. Leave blank if filtering on one or zero metadatas.
$metadata2 = 'include_subtree'
# An addiontal metadata value associated with metadata2.  Leave blank if filtering on one or zero metadatas.
$metavalue2 =  'false'


# Enter the full path for the output location of the datafile.
$datafile =  'C:\temp\reports\refDocumentList.csv'

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
    If ($metadata1){
    If ($customer_id -eq "1"){
	$parameters = @{
		$metadata1 = $metavalue1;
        $metadata2 = $metavalue2;
		"limit" = 5000;
		"cursor" = "";
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}}
    else {
    $parameters = @{
		$metadata1 = $metavalue1;
        $metadata2 = $metavalue2;
		"limit" = 5000;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}    } }
    else {
    If ($customer_id -eq "1"){
	$parameters = @{
		$metadata1 = $metavalue1;
        #$metadata2 = $metavalue2;
		"limit" = 5000;
		"cursor" = "";
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}}
    else {
    $parameters = @{
		$metadata1 = $metavalue1;
        #$metadata2 = $metavalue2;
		"limit" = 5000;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}    } }
        # Create header
        "Document_number`tDocument_name`tAuthor`tDefault_Security`tLast_user`tEdit_date`tCreate_date`tClass`tType`tSize`tCustom1_ALIAS`tCustom1_Description`tCustom2_ALIAS`tCustom2_Description” | out-file $datafile -append

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
        If ($metadata1){
        If ($null -ne $response.cursor) {
           $parameters = @{
		$metadata1 = $metavalue1;
        $metadata2 = $metavalue2;
		"limit" = 5000;
		"cursor" = $response.cursor;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}
		}
        else {
            Break
		}   }
        else {   
        If ($null -ne $response.cursor) {
           $parameters = @{
		$metadata1 = $metavalue1;
        #$metadata2 = $metavalue2;
		"limit" = 5000;
		"cursor" = $response.cursor;
		"paging_mode" = "standard_cursor";
		"sort_order" = "asc";
	}
		}
        else {
            Break
		}   }
                                        }
        # Loop through all results in Cursor
		$response.data.results | ForEach-Object {
		    # Default Values that will show if no data is sent.
            $documentNumber = if ($null -ne $_.id) { $_.id } else { "NoIDFound" }
			$name = if ($null -ne $_.name) { $_.name } else { "NoIDFound" }
			$author = if ($null -ne $_.author) { $_.author } else { "NoIDFound" }
			$security = if ($null -ne $_.default_security) { $_.default_security } else { "NoIDFound" }
			$last_user = if ($null -ne $_.last_user) { $_.last_user } else { "NoIDFound" }
			$edit_date = if ($null -ne $_.edit_date) { $_.edit_date } else { "NoIDFound" }
            $create_date = if ($null -ne $_.create_date) { $_.create_date } else { "NoIDFound" }
            $class = if ($null -ne $_.class) { $_.class } else { "NoIDFound" }
            $type = $_.type
            $size = if ($null -ne $_.size) { $_.size } else { "NoIDFound" }
            $custom1 = if ($null -ne $_.custom1) { $_.custom1 } else { "NoIDFound" }
            $custom1_description = if ($null -ne $_.custom1_description) { $_.custom1_description } else { "NoIDFound" }
             
            $custom2 = if ($null -ne $_.custom2) { $_.custom2 } else { "NoIDFound" }
            $custom2_description = if ($null -ne $_.custom2_description) { $_.custom2_description } else { "NoIDFound" }
			

            $outString = "$documentNumber`t$name`t$author`t$security`t$last_user`t$edit_date`t$create_date`t$class`t$type`t$size`t$custom1`t$custom1_description`t$custom2`t$custom2_description"
            Write-host $outString

            $outString | Out-File $datafile -Append
            # Send the request as an HTTP 'DELETE' request.
            $response = Invoke-RestMethod -Method Delete -Uri "https://$server/api/v2/customers/$customer_id/libraries/$library/folders/$metavalue1/documents/$documentNumber" -Header $header
            Write-Host "Successfully Deleted Document ($($_.id)) from Folder ($folder_id)"
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
	$resource = "https://$server/api/v2/customers/$customer_id/libraries/$library/documents"

    Write-Host -Message "Getting list of documents"
    GetDocument($resource)
    Write-Host -Message "Document list complete for $library database. List output to $datafile"

    SignOut
}

Main