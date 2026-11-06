import { CircleCheck, CircleX, ClockArrowDown } from 'lucide-react';
import React from 'react'
import type { BadgeContext } from '@/types/ui';

type Props = {
  label: string;
  status: BadgeContext;
  onClick?: () => void;
}

const StatusTag: React.FC<Props> = ({ label, status, onClick }) => {
  const statusClasses = {
    success: "bg-success text-white",
    error: "bg-error text-white",
    warning: "bg-warning text-white",
    mute: "bg-gray-100 text-gray-800",
  }

  const statusIcon = {
    success: <CircleCheck className="md:w-5 md:h-5 w-4 h-4 mr-1" />,
    error: <CircleX className="md:w-5 md:h-5 w-4 h-4 mr-1" />,
    warning: <ClockArrowDown className="md:w-5 md:h-5 w-4 h-4 mr-1" />,
    mute: "",
  }

  return (
    <button onClick={onClick} className={`inline-flex items-center justify-start md:px-7 md:py-3 px-4 py-2 rounded-2xl md:text-xl text-sm font-semibold ${statusClasses[status]}`}>
       {statusIcon[status]} {label}
    </button>
  )
}

export default StatusTag
