import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotBlank', async: false })
class IsNotBlankConstraint implements ValidatorConstraintInterface {
  // tslint:disable-next-line:no-any
  validate(value: any) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be empty`;
  }
}
const blankFunctions = function (object: object, propertyName: string) {
  registerDecorator({
    target: object.constructor,
    propertyName,
    constraints: [],
    options: {},
    validator: IsNotBlankConstraint,
  });
};

export function IsNotBlank() {
  return blankFunctions;
}
