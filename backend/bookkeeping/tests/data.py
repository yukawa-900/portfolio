sample_user = {
    'email': 'sample@example.com',
    'password': 'mysecretpassword',
}

base_params = {
            "date": "2020-11-16",
            "slipNum": 5,
            "pdf": None,  # (JSON)null
            "memo": "hey",
            "transactions": [
                {
                    "debitCredit": 0,
                    "account": "28a269f8-57bc-46b9-a207-daf16e7780cd",
                    "accountName": "現金",
                    "money": 2000,
                    "order": 0
                },
                {
                    "debitCredit": 1,
                    "account": "28a269f8-57bc-46b9-a207-daf16e7780cd",
                    "accountName": "売上",
                    "money": 2000,
                    "order": 1
                }
            ]
        }
