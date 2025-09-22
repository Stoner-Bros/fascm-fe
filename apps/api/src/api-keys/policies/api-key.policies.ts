import { Action, AppAbility } from '../../casl/ability.factory';
import { ApiKey } from '../schema/api-key.schema';

export class ApiKeyPolicies {
  static read(ability: AppAbility) {
    return ability.can(Action.Read, ApiKey);
  }

  static create(ability: AppAbility) {
    return ability.can(Action.Create, ApiKey);
  }

  static update(ability: AppAbility, apiKey: ApiKey) {
    return ability.can(Action.Update, apiKey);
  }

  static delete(ability: AppAbility, apiKey: ApiKey) {
    return ability.can(Action.Delete, apiKey);
  }
}
