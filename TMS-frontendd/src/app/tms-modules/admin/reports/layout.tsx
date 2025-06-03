import React from 'react';
import ReportHeader from './components/ReportHeader';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <ReportHeader />
      {children}
    </div>
  );
}