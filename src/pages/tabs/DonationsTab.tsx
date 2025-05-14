
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Gift, DollarSign } from 'lucide-react';

const DonationsTab = () => {
  const organizations = [
    {
      id: 1,
      name: 'Education For All',
      description: 'Providing educational resources to underserved communities',
      goal: 10000,
      raised: 7500,
      category: 'Education'
    },
    {
      id: 2,
      name: 'Clean Water Initiative',
      description: 'Ensuring access to clean water in developing regions',
      goal: 15000,
      raised: 9200,
      category: 'Environment'
    },
    {
      id: 3,
      name: 'Youth Empowerment',
      description: 'Mentoring and supporting at-risk youth',
      goal: 8000,
      raised: 6100,
      category: 'Social Services'
    }
  ];

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
        <Button size="sm" className="btn-primary">
          <Gift className="mr-1" size={16} />
          My Donations
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="social">Social Services</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Search..." className="flex-1" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {organizations.map((org) => {
          const progress = (org.raised / org.goal) * 100;
          
          return (
            <Card key={org.id}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 font-normal">
                      {org.category}
                    </Badge>
                  </div>
                  <Button size="sm" className="btn-secondary">
                    <DollarSign size={14} />
                    Donate
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-gray-600 mb-3">{org.description}</p>
                
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-nuevagen-blue"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span className="text-gray-600">
                      ${org.raised.toLocaleString()} raised
                    </span>
                    <span className="text-gray-600">
                      Goal: ${org.goal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DonationsTab;
