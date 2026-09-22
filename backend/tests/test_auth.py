SIGNUP_BODY = {
    "email": "new@mail.kz",
    "password": "password123",
    "name": "Аян",
    "grade": "10 класс",
}


def test_signup_creates_user_and_returns_token(client):
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)

    assert res.status_code == 201
    body = res.get_json()
    assert body["token"]
    assert body["user"] == {
        "id": body["user"]["id"],
        "name": "Аян",
        "email": "new@mail.kz",
        "grade": "10 класс",
    }


def test_signup_duplicate_email_is_conflict(client):
    client.post("/api/v1/auth/signup", json=SIGNUP_BODY)
    res = client.post("/api/v1/auth/signup", json=SIGNUP_BODY)

    assert res.status_code == 409


def test_signup_invalid_body_is_bad_request(client):
    res = client.post("/api/v1/auth/signup", json={"email": "not-an-email"})

    assert res.status_code == 400


def test_signin_with_correct_password(client):
    client.post("/api/v1/auth/signup", json=SIGNUP_BODY)

    res = client.post(
        "/api/v1/auth/signin",
        json={"email": SIGNUP_BODY["email"], "password": SIGNUP_BODY["password"]},
    )

    assert res.status_code == 200
    assert res.get_json()["token"]


def test_signin_with_wrong_password_is_unauthorized(client):
    client.post("/api/v1/auth/signup", json=SIGNUP_BODY)

    res = client.post(
        "/api/v1/auth/signin", json={"email": SIGNUP_BODY["email"], "password": "wrong-password"}
    )

    assert res.status_code == 401
