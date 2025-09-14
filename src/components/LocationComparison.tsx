import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { MapPin, TrendingUp, TrendingDown } from 'lucide-react';

// Sample comparison data between two locations
const comparisonData = [
  {
    metric: 'Water Level',
    location1: 11.2,
    location2: 8.5,
    unit: 'm'
  },
  {
    metric: 'Quality Index',
    location1: 70,
    location2: 45,
    unit: '%'
  },
  {
    metric: 'TDS Level',
    location1: 650,
    location2: 890,
    unit: 'ppm'
  },
  {
    metric: 'pH Level',
    location1: 7.2,
    location2: 6.8,
    unit: ''
  },
  {
    metric: 'Dissolved Oxygen',
    location1: 6.8,
    location2: 4.2,
    unit: 'mg/L'
  }
];

const radarData = [
  { subject: 'Water Level', location1: 75, location2: 45 },
  { subject: 'Quality', location1: 70, location2: 45 },
  { subject: 'TDS', location1: 35, location2: 15 }, // Inverted for radar (lower is better)
  { subject: 'pH', location1: 80, location2: 70 },
  { subject: 'Dissolved O2', location1: 85, location2: 50 },
];

export const LocationComparison: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* Location Headers */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="gradient-water text-primary-foreground">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2" />
            <h3 className="font-semibold">Delhi</h3>
            <p className="text-sm opacity-90">Your Location</p>
          </CardContent>
        </Card>
        
        <Card className="gradient-earth text-secondary-foreground">
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2" />
            <h3 className="font-semibold">Mumbai</h3>
            <p className="text-sm opacity-90">Comparison Location</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Groundwater Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}${props.payload.unit}`, 
                  name === 'location1' ? 'Delhi' : 'Mumbai'
                ]}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="location1" fill="hsl(var(--primary))" name="Delhi" />
              <Bar dataKey="location2" fill="hsl(var(--secondary))" name="Mumbai" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={60} domain={[0, 100]} />
              <Radar
                name="Delhi"
                dataKey="location1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Radar
                name="Mumbai"
                dataKey="location2"
                stroke="hsl(var(--secondary))"
                fill="hsl(var(--secondary))"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparisonData.map((item, index) => {
          const difference = item.location1 - item.location2;
          const isPositive = difference > 0;
          const isTDS = item.metric === 'TDS Level';
          const isGoodChange = isTDS ? difference < 0 : difference > 0;
          
          return (
            <Card key={index} className="hover:shadow-md transition-smooth">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{item.metric}</h4>
                  {isGoodChange ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Delhi</span>
                    <span className="font-semibold">
                      {item.location1}{item.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Mumbai</span>
                    <span className="font-semibold">
                      {item.location2}{item.unit}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Difference</span>
                      <span className={`text-xs font-medium ${
                        isGoodChange ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{difference.toFixed(1)}{item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Summary</h4>
          <p className="text-sm text-muted-foreground">
            Delhi shows better overall groundwater quality compared to Mumbai, with higher water levels, 
            better quality index, and lower TDS levels. However, both locations require monitoring 
            for sustainable water management.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};