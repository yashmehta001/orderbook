export const successMessages = {
  SELL_ORDER_CREATED: 'Sell Order created successfully',
  BUY_ORDER_CREATED: 'Buy Order created successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_CREATED: 'User created successfully',

  FUND_UPDATED: 'Funds successfully updated',
} as const;

export const errorMessages = {
  INSUFFICIENT_BALANCE: 'Insufficient Balance',
  BAD_REQUEST: 'Bad Request',
  USER_NOT_FOUND: 'User not found',
  INCORRECT_CREDENTIALS: 'Incorrect email or password',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
} as const;
