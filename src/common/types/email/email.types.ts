export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}
