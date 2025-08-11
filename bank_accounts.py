class BankAccount:
    def __init__(self, first_name, last_name, account_id, account_type, pin, balance):
        self.first_name = first_name
        self.last_name = last_name
        self.account_id = account_id
        self.account_type = account_type
        self.pin = pin
        self.balance = balance
    def deposit(self, amount):
       if amount <= 0:
           raise ValueError("Deposit amount must be positive")
       self.balance += amount
       return self.balance
    def withdraw(self, amount):
        if amount <=0:
            raise ValueError("Withdraw amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return amount
    def display_balance(self):
        print(f"Current balance: ${self.balance:,.2f}")

        

ted = BankAccount("Ted", "Mosby", 1001, "Checking", 2532, 500)
lily = BankAccount("Lily", "Aldrin", 1002, "Credit", 2550, 100.3)
marshall = BankAccount("Marshall", "Ericksen", 1003, "Checking", 2385, 1000.25)
barney = BankAccount("Barney", "Stinson", 1000, "Checking", 2540, 10000.3)

ted.deposit(10)
ted.withdraw(20)
ted.display_balance()