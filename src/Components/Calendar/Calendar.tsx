import { useIntl } from "react-intl";
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

  const intl = useIntl();

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    intl.formatDate(new Date(2024, 0, 7 + index), { weekday: "long" }),
  );

  // Use currentTarget to always get the .day wrapper div, even if clicking the number text
  const dayOnClick = (e: MouseEvent<HTMLElement>) => {
    console.log(e.currentTarget);
  };

  return (
    <div className="calendarContainer">
      <div className="calendar">
        <div>
          <div className="controls">
            <button className="leftButton" onClick={prevSelectedMonth}>
              {intl.formatMessage({ id: "calendar.prev", defaultMessage: "prev" })}
            </button>
            <button className="rightButton" onClick={nextSelectedMonth}>
              {intl.formatMessage({ id: "calendar.next", defaultMessage: "next" })}
            </button>
          </div>
          <div className="monthTitle">
            {intl.formatDate(selectedDay, { month: "long", year: "numeric" })}
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
                    {intl.formatNumber(day.getDate())}
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
