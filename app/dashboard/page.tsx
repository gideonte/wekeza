import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, DollarSign, LineChart, Users } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">+7 new members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last year</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Investment chart will be displayed here</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>You have 3 upcoming events this month.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Investment Workshop</p>
                      <p className="text-sm text-muted-foreground">Apr 15, 2025 • 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Quarterly Meeting</p>
                      <p className="text-sm text-muted-foreground">Apr 23, 2025 • 5:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Financial Literacy Webinar</p>
                      <p className="text-sm text-muted-foreground">Apr 30, 2025 • 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Investments</CardTitle>
              <CardDescription>Overview of your active investment portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Real Estate Fund</p>
                    <p className="text-2xl font-bold">$12,500</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Return</p>
                    <p className="text-2xl font-bold text-green-500">+8.2%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-2xl font-bold">2 years</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Tech Startup Fund</p>
                    <p className="text-2xl font-bold">$8,750</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Return</p>
                    <p className="text-2xl font-bold text-green-500">+15.7%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-2xl font-bold">18 months</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Dividend Portfolio</p>
                    <p className="text-2xl font-bold">$23,980</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Return</p>
                    <p className="text-2xl font-bold text-green-500">+6.5%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-2xl font-bold">Ongoing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Document uploaded:</span> Q1 Financial Report
                    </p>
                    <p className="text-xs text-muted-foreground">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Investment completed:</span> Tech Startup Fund
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">New message:</span> From Sarah about the upcoming meeting
                    </p>
                    <p className="text-xs text-muted-foreground">Yesterday, 11:45 AM</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Profile updated:</span> Contact information changed
                    </p>
                    <p className="text-xs text-muted-foreground">Apr 2, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

