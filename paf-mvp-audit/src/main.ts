import { Locale } from './locale';
import { Controller } from './controller';

const audit = new Controller(new Locale(window.navigator.languages), new AuditLog());
