import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, ExternalLink, Unlink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { queryClient, apiRequest } from "@/lib/queryClient"

interface MetaConnectionStatus {
  connected: boolean
  valid: boolean
  connectedAt: string | null
  accountsCount: number
}

export function MetaConnectionCard() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Check Meta connection status
  const { data: status, isLoading, refetch } = useQuery<MetaConnectionStatus>({
    queryKey: ['/api/auth/meta/status'],
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/meta/disconnect', {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Meta Ads Disconnected",
        description: "Your Meta Ads account has been disconnected successfully."
      })
      refetch()
      // Invalidate related data
      queryClient.invalidateQueries({ queryKey: ['/api/ad-accounts'] })
      queryClient.invalidateQueries({ queryKey: ['/api/account-insights'] })
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] })
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect Meta Ads account",
        variant: "destructive"
      })
    }
  })

  // Connect to Meta Ads using OAuth Broker
  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      
      // Start OAuth flow through broker
      const response = await fetch('/api/oauth-broker/meta/start', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to start OAuth flow')
      }
      
      const { authUrl, linkSessionId, expiresAt } = await response.json()
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl, 
        'meta-oauth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      )
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      // Listen for postMessage from OAuth broker
      const handleMessage = (event: MessageEvent) => {
        // Security: Accept messages from our broker origin or same origin
        const brokerOrigin = import.meta.env.VITE_OAUTH_BROKER_ORIGIN || window.location.origin;
        if (event.origin !== brokerOrigin && event.origin !== window.location.origin) return
        
        if (event.data?.type === 'oauth-complete') {
          window.removeEventListener('message', handleMessage)
          clearTimeout(pollTimeout)
          clearInterval(checkClosed)
          
          if (event.data.success) {
            toast({
              title: "Connection Successful",
              description: "Your Meta Ads account has been connected successfully.",
            })
            refetch()
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['/api/ad-accounts'] })
            queryClient.invalidateQueries({ queryKey: ['/api/account-insights'] })
            queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] })
          } else {
            toast({
              title: "Connection Failed",
              description: event.data.error || "Meta Ads connection failed",
              variant: "destructive"
            })
          }
          setIsConnecting(false)
        }
      }

      window.addEventListener('message', handleMessage)

      // Polling fallback for browsers that block postMessage
      let pollCount = 0
      const maxPolls = 30 // 5 minutes at 10 second intervals
      
      const pollStatus = async () => {
        try {
          // Support cross-origin broker URLs
          const brokerBaseUrl = import.meta.env.VITE_OAUTH_BROKER_URL || '';
          const statusUrl = brokerBaseUrl 
            ? `${brokerBaseUrl}/meta/status/${linkSessionId}`
            : `/api/oauth-broker/meta/status/${linkSessionId}`;
          
          const statusResponse = await fetch(statusUrl)
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            
            if (statusData.completed) {
              window.removeEventListener('message', handleMessage)
              clearInterval(checkClosed)
              
              toast({
                title: "Connection Successful",
                description: "Your Meta Ads account has been connected successfully.",
              })
              refetch()
              queryClient.invalidateQueries({ queryKey: ['/api/ad-accounts'] })
              queryClient.invalidateQueries({ queryKey: ['/api/account-insights'] })
              queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] })
              setIsConnecting(false)
              return
            }
            
            if (statusData.error) {
              window.removeEventListener('message', handleMessage)
              clearInterval(checkClosed)
              
              toast({
                title: "Connection Failed",
                description: statusData.error,
                variant: "destructive"
              })
              setIsConnecting(false)
              return
            }
          }
          
          // Continue polling if not completed and not expired
          pollCount++
          if (pollCount < maxPolls && Date.now() < expiresAt) {
            setTimeout(pollStatus, 10000) // Poll every 10 seconds
          } else {
            // Timeout
            window.removeEventListener('message', handleMessage)
            clearInterval(checkClosed)
            setIsConnecting(false)
            
            toast({
              title: "Connection Timeout",
              description: "OAuth flow timed out. Please try again.",
              variant: "destructive"
            })
          }
        } catch (error) {
          console.error('Error polling OAuth status:', error)
        }
      }

      const pollTimeout = setTimeout(pollStatus, 10000) // Start polling after 10 seconds

      // Listen for popup close (cleanup)
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          clearTimeout(pollTimeout)
          window.removeEventListener('message', handleMessage)
          setIsConnecting(false)
        }
      }, 1000)
      
    } catch (error: any) {
      setIsConnecting(false)
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start Meta Ads connection",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = () => {
    disconnectMutation.mutate()
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking connection status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="meta-connection-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Meta Ads Connection
              {status?.connected && status?.valid && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {status?.connected && !status?.valid && (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </CardTitle>
            <CardDescription>
              Connect your Meta Ads account to access real performance data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status?.connected ? (
              <Badge variant={status.valid ? "default" : "destructive"}>
                {status.valid ? "Connected" : "Invalid Token"}
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {status?.connected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Connected:</span>
                <p className="font-medium">
                  {status.connectedAt 
                    ? new Date(status.connectedAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Ad Accounts:</span>
                <p className="font-medium">{status.accountsCount} accounts</p>
              </div>
            </div>
            
            {!status.valid && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Token Invalid</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Your Meta Ads access token has expired or been revoked. 
                  Please reconnect to continue using Performance Agent.
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                data-testid="button-refresh-status"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                data-testid="button-disconnect-meta"
              >
                <Unlink className="h-4 w-4 mr-2" />
                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Connect your Meta Business Manager</strong> to access real-time performance data, 
                campaign insights, and AI-powered recommendations for your ad accounts.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">What you'll get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time campaign performance metrics</li>
                <li>• AI-generated weekly insights and recommendations</li>
                <li>• Automatic creative fatigue detection</li>
                <li>• Cross-campaign performance analysis</li>
              </ul>
            </div>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              data-testid="button-connect-meta"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Meta Ads Account'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}