from app.services.payments.mock_provider import MockPaymentProvider


def test_mock_provider_always_succeeds():
    provider = MockPaymentProvider()

    result = provider.charge(
        plan_id="month", period="Месяц", price="1 900 тг", payment_method="card"
    )

    assert result.status == "success"
    assert result.renews_at
    assert result.summary == "Месяц · 1 900 тг"


def test_mock_provider_week_renews_sooner_than_month():
    provider = MockPaymentProvider()

    week = provider.charge(plan_id="week", period="Неделя", price="500 тг", payment_method="card")
    month = provider.charge(
        plan_id="month", period="Месяц", price="1 900 тг", payment_method="card"
    )

    assert week.renews_at != month.renews_at
