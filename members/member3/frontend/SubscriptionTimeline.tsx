import React from 'react';
import { History, CheckCircle, Clock, PauseCircle, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  id?: string;
  previousStatus: string;
  newStatus: string;
  changedByUser?: { name: string } | null;
  changeReason?: string | null;
  createdAt: string | Date;
}

interface SubscriptionTimelineProps {
  events: TimelineEvent[];
}

export const SubscriptionTimeline: React.FC<SubscriptionTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
        No status history recorded yet.
      </div>
    );
  }

  // Sort descending
  const sorted = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500 text-white';
      case 'CONFIRMED':
        return 'bg-blue-500 text-white';
      case 'PAUSED':
        return 'bg-amber-500 text-white';
      case 'CLOSED':
        return 'bg-slate-600 text-white';
      default:
        return 'bg-indigo-500 text-white';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sorted.map((event, idx) => {
          const isLast = idx === sorted.length - 1;
          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white font-bold text-xs ${getStatusColor(
                        event.newStatus
                      )}`}
                    >
                      {event.newStatus.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        Status changed to{' '}
                        <span className="font-extrabold uppercase text-indigo-600">
                          {event.newStatus}
                        </span>{' '}
                        {event.previousStatus && (
                          <span className="text-slate-400 font-normal">
                            (from {event.previousStatus})
                          </span>
                        )}
                      </p>
                      {event.changeReason && (
                        <p className="text-xs text-slate-600 mt-0.5">{event.changeReason}</p>
                      )}
                      {event.changedByUser && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          By: {event.changedByUser.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-[11px] whitespace-nowrap text-slate-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
