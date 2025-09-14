import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Droplets, Activity } from 'lucide-react';

interface DataVisualizationProps {
  isPrediction?: boolean;
}

interface GroundwaterDataPoint {
  year: string;
  waterLevel: number;
  quality: number;
  tds: number;
  predicted?: boolean;
}

// Sample groundwater data
const historicalData: GroundwaterDataPoint[] = [
  { year: '2019', waterLevel: 15.2, quality: 85, tds: 450 },
  { year: '2020', waterLevel: 14.8, quality: 82, tds: 470 },
  { year: '2021', waterLevel: 13.5, quality: 78, tds: 520 },
  { year: '2022', waterLevel: 12.8, quality: 75, tds: 580 },
  { year: '2023', waterLevel: 11.9, quality: 72, tds: 620 },
  { year: '2024', waterLevel: 11.2, quality: 70, tds: 650 },
];

const predictiveData: GroundwaterDataPoint[] = [
  ...historicalData,
  { year: '2025', waterLevel: 10.5, quality: 68, tds: 680, predicted: true },
  { year: '2026', waterLevel: 9.8, quality: 65, tds: 720, predicted: true },
  { year: '2027', waterLevel: 9.2, quality: 62, tds: 760, predicted: true },
  { year: '2028', waterLevel: 8.6, quality: 58, tds: 800, predicted: true },
  { year: '2029', waterLevel: 8.1, quality: 55, tds: 840, predicted: true },
];

const monthlyData = [
  { month: 'Jan', level: 11.5, rainfall: 2.3 },
  { month: 'Feb', level: 11.3, rainfall: 1.8 },
  { month: 'Mar', level: 10.8, rainfall: 0.5 },
  { month: 'Apr', level: 10.2, rainfall: 0.2 },
  { month: 'May', level: 9.8, rainfall: 0.1 },
  { month: 'Jun', level: 10.5, rainfall: 45.2 },
  { month: 'Jul', level: 12.8, rainfall: 125.6 },
  { month: 'Aug', level: 13.2, rainfall: 98.4 },
  { month: 'Sep', level: 12.5, rainfall: 67.3 },
  { month: 'Oct', level: 11.8, rainfall: 23.1 },
  { month: 'Nov', level: 11.4, rainfall: 8.7 },
  { month: 'Dec', level: 11.6, rainfall: 4.2 },
];

export const DataVisualization: React.FC<DataVisualizationProps> = ({ isPrediction = false }) => {
  const data = isPrediction ? predictiveData : historicalData;

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Levels
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Groundwater Level Trends {isPrediction && '(5-Year Prediction)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}m`, 
                      name === 'waterLevel' ? 'Water Level' : name
                    ]}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="waterLevel" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    name="Water Level"
                  />
                  {isPrediction && (
                    <Line 
                      type="monotone" 
                      dataKey="waterLevel" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={(props) => {
                        const isPredict = data[props.index]?.predicted;
                        return isPredict ? 
                          <circle cx={props.cx} cy={props.cy} r={4} fill="hsl(var(--secondary))" stroke="hsl(var(--secondary))" strokeWidth={2} /> : 
                          null;
                      }}
                      name="Predicted Level"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Water Quality Index</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">TDS Levels (ppm)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tds" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Water Level vs Rainfall</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="level" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Water Level (m)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="rainfall" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    name="Rainfall (mm)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-water text-primary-foreground">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">11.2m</div>
            <div className="text-sm opacity-90">Current Level</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-earth text-secondary-foreground">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">70%</div>
            <div className="text-sm opacity-90">Quality Index</div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-accent-foreground">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">650</div>
            <div className="text-sm opacity-90">TDS (ppm)</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};