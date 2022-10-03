import { parseDuration } from '@onekey/frontend/utils/date-utils';

describe('ISO-8601 duration parser', () => {
  const invalid_inputs = [null, 'SOME_RANDOM_STRING', 'PTT1S', ''];
  test.each(invalid_inputs)('should return null if the input is not a valid ISO-8601 string (%s)', (input) => {
    expect(parseDuration(input)).toBeNull;
  });

  const valid_data = [
    {
      input: 'PT1S', // 1 second
      expected_output: 1,
    },
    {
      input: 'P1W3DT5H30M', // 1 week, 3 days, 5 hours & 30 minutes
      expected_output: 883800,
    },
    {
      input: 'P2Y3M1W2DT4H22M15S', // 2 years, 3 months, 1 week, 2 days, 4 hours, 22 minutes & 15 seconds
      expected_output: 71749335,
    },
    {
      input: 'P333Y51M', // Some big value : 333 years & 51 months
      expected_output: 10635516000,
    },
  ];
  test.each(valid_data)(
    'should return the corresponding duration in seconds when the input is a valid ISO string ($input)',
    (data) => {
      expect(parseDuration(data.input)).toEqual(data.expected_output);
    }
  );
});
