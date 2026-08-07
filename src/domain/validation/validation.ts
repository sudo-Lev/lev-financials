import { failure, type Result, success } from '@/domain/shared/result'

export type ConfidenceLevel = 'certain' | 'high' | 'low' | 'medium' | 'unknown'

export type ValidationIssue = Readonly<{
  code: string
  field?: string
}>

export type ValidationState =
  | Readonly<{ issues: readonly []; status: 'pending' | 'valid' }>
  | Readonly<{
      issues: readonly [ValidationIssue, ...ValidationIssue[]]
      status: 'invalid' | 'warning'
    }>

export type ValidationStateError = Readonly<{
  code: 'validation_issues_required'
  status: 'invalid' | 'warning'
}>

export function createValidationState(
  status: 'pending' | 'valid',
  issues?: readonly [],
): Result<ValidationState, ValidationStateError>
export function createValidationState(
  status: 'invalid' | 'warning',
  issues: readonly ValidationIssue[],
): Result<ValidationState, ValidationStateError>
export function createValidationState(
  status: ValidationState['status'],
  issues: readonly ValidationIssue[] = [],
): Result<ValidationState, ValidationStateError> {
  if ((status === 'invalid' || status === 'warning') && issues.length === 0) {
    return failure({ code: 'validation_issues_required', status })
  }

  if (status === 'invalid' || status === 'warning') {
    const [firstIssue, ...remainingIssues] = issues

    if (!firstIssue) {
      return failure({ code: 'validation_issues_required', status })
    }

    const issueTuple: [ValidationIssue, ...ValidationIssue[]] = [firstIssue, ...remainingIssues]
    const state: ValidationState = Object.freeze({
      issues: Object.freeze(issueTuple),
      status,
    })

    return success(state)
  }

  const noIssues: readonly [] = Object.freeze([])
  const state: ValidationState = Object.freeze({ issues: noIssues, status })

  return success(state)
}
