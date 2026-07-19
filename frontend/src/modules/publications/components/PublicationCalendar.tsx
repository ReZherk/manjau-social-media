import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { PublicationResponse } from '../types/publicationTypes';

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface PublicationCalendarProps {
  publications: PublicationResponse[];
  onSelect?: (publication: PublicationResponse) => void;
}

export function PublicationCalendar({ publications, onSelect }: PublicationCalendarProps) {
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const firstDay = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leadingBlanks = firstDay.getDay();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  const byDay = new Map<number, PublicationResponse[]>();
  for (const pub of publications) {
    const d = new Date(pub.scheduledAt);
    if (d.getFullYear() === cursor.year && d.getMonth() === cursor.month) {
      const list = byDay.get(d.getDate()) ?? [];
      list.push(pub);
      byDay.set(d.getDate(), list);
    }
  }

  const move = (delta: number) => {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <section className="card overflow-hidden">
      <div className="h-16 grid grid-cols-[42px_1fr_42px] items-center border-b border-border">
        <button onClick={() => move(-1)} className="text-text-muted hover:text-text grid place-items-center" aria-label="Mes anterior"><ChevronLeft className="w-5 h-5 mx-auto" /></button>
        <strong className="text-center font-serif text-base">{MONTHS[cursor.month]} {cursor.year}</strong>
        <button onClick={() => move(1)} className="text-text-muted hover:text-text grid place-items-center" aria-label="Mes siguiente"><ChevronRight className="w-5 h-5 mx-auto" /></button>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-2 text-center text-[10px] text-lavender">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const events = day ? byDay.get(day) ?? [] : [];
          const isToday = day != null && `${cursor.year}-${cursor.month}-${day}` === todayKey;
          return (
            <div key={idx} className={cn('min-h-[92px] p-2 border-r border-b border-[#f1e9ed] text-[10px]', !day && 'bg-[#fffdfd]')}>
              {day && (
                <span className={cn('inline-grid place-items-center min-w-[22px] min-h-[22px]', isToday && 'text-white bg-pink rounded-full')}>{day}</span>
              )}
              {events.map((pub) => (
                <button
                  key={pub.id}
                  onClick={() => onSelect?.(pub)}
                  className="mt-1.5 block w-full text-left px-1.5 py-1 rounded text-[9px] text-lavender bg-lavender-soft truncate hover:brightness-95"
                  title={pub.title}
                >
                  {new Date(pub.scheduledAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} · {pub.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
