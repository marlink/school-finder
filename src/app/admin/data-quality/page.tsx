'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

export default function DataQuality() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await adminApi.getDataQualityReport()
      setReport(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleFixIssue = async (schoolId: string, field: string, value: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await adminApi.fixDataQualityIssue({
        schoolId,
        fixes: { [field]: value }
      })
      
      setSuccess(`Fixed ${field} for school ID: ${schoolId}`)
      fetchReport() // Refresh the report
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Quality Report</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Quality Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !report ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card rounded-md border text-center">
                <p className="text-sm text-muted-foreground">Total Schools</p>
                <p className="text-3xl font-bold">{report.totalSchools}</p>
              </div>
              
              <div className="p-4 bg-card rounded-md border text-center">
                <p className="text-sm text-muted-foreground">Valid Schools</p>
                <p className="text-3xl font-bold">{report.validSchools}</p>
              </div>
              
              <div className="p-4 bg-card rounded-md border text-center">
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-3xl font-bold">{report.issueCount}</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      {success && (
        <div className="bg-green-500/10 p-4 rounded-md">
          <p className="text-green-500">{success}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !report ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 p-4 rounded-md">
              <p className="text-destructive">Error: {error}</p>
            </div>
          ) : report && report.issues && report.issues.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School Name</TableHead>
                    <TableHead>Issue Type</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Suggested Fix</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.issues.map((issue: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{issue.schoolName}</TableCell>
                      <TableCell>{issue.type}</TableCell>
                      <TableCell>{issue.field}</TableCell>
                      <TableCell>{issue.currentValue || 'Empty'}</TableCell>
                      <TableCell>{issue.suggestedFix || 'N/A'}</TableCell>
                      <TableCell>
                        {issue.suggestedFix && (
                          <Button 
                            size="sm"
                            onClick={() => handleFixIssue(issue.schoolId, issue.field, issue.suggestedFix)}
                            disabled={loading}
                          >
                            Apply Fix
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-4">No data quality issues found.</p>
          )}
          
          <div className="mt-4">
            <Button onClick={fetchReport} variant="outline" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Report'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}