import datetime as dt

_RU_MONTHS_GENITIVE = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
]


def ru_date(date: dt.date) -> str:
    """«14 марта»."""
    return f"{date.day} {_RU_MONTHS_GENITIVE[date.month - 1]}"


def ru_date_with_today(date: dt.date) -> str:
    """«сегодня, 14 марта» для сегодняшней даты, иначе как `ru_date`."""
    label = ru_date(date)
    return f"сегодня, {label}" if date == dt.date.today() else label
