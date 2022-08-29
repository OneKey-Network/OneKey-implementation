export enum PafStatus {
  // The user chose to not participate (closed the settings window on this website)
  NOT_PARTICIPATING = 'NOT_PARTICIPATING',
  // The user is participating (either opt in or opt out)
  PARTICIPATING = 'PARTICIPATING',
  // A redirect is needed before any data can be used
  REDIRECT_NEEDED = 'REDIRECT_NEEDED',
  // A redirect is on the way, the browser will exit this page anytime soon
  REDIRECTING = 'REDIRECTING',
  // Never seen this user yet
  UNKNOWN = 'UNKNOWN',
}
