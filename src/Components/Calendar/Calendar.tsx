import { format } from "date-fns";
import { MouseEvent } from "react";
import useSelectedMonth from "../../Hooks/UseSelectedMonth";
import "./Calendar.css";

const Calendar = () => {
  const {
    selectedMonth,
    nextSelectedMonth,
    prevSelectedMonth,
    selectedDay,
  } = useSelectedMonth();

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Use currentTarget to always get the .day wrapper div, even if clicking the number text
  const dayOnClick = (e: MouseEvent<HTMLElement>) => {
    console.log(e.currentTarget);
  };

  return (
    <div className="calendarContainer">
      <div className="calendar">
        <div>
          <div className="controls">
            <button className="leftButton" onClick={prevSelectedMonth}>prev</button>
            <button className="rightButton" onClick={nextSelectedMonth}>next</button>
          </div>
          <div className="monthTitle">
            {format(selectedDay, 'MMMM')} {format(selectedDay, 'yyyy')}
          </div>
          <div className="headers">
            {weekdays.map(day => (
              <div key={day} className="headerCell">
                {day}
              </div>
            ))}
          </div>
        </div>
        <div className="weekdays">
          {selectedMonth.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const isoString = day.toISOString() + weekIndex;
              const className = dayIndex === 6 ? "saturday" : "day";

              return (
                <div 
                  onClick={dayOnClick} 
                  className={className} 
                  key={isoString}
                >
                  <div className="dayNumber">
                    {format(day, "d")}
                  </div>
                </div>
              );
            })
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
