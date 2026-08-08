import type { ParsedMillenniumStatement } from './millennium-statement-parser'

export type StatementReconciliation = Readonly<{
  isBalanced: boolean
  issues: readonly StatementReconciliationIssue[]
}>

export type StatementReconciliationIssue = Readonly<{
  code: 'closing_balance_mismatch' | 'running_balance_mismatch'
  transactionIndex?: number
}>

export function reconcileStatement(statement: ParsedMillenniumStatement): StatementReconciliation {
  const issues: StatementReconciliationIssue[] = []
  const expectedClosing =
    statement.openingBalance.minorUnits +
    statement.totals.credits.minorUnits -
    statement.totals.debits.minorUnits

  if (expectedClosing !== statement.closingBalance.minorUnits) {
    issues.push({ code: 'closing_balance_mismatch' })
  }

  let runningBalance = statement.openingBalance.minorUnits
  statement.transactions.forEach((transaction, transactionIndex) => {
    runningBalance += transaction.amount.minorUnits
    if (
      transaction.balanceAfter !== undefined &&
      transaction.balanceAfter.minorUnits !== runningBalance
    ) {
      issues.push({ code: 'running_balance_mismatch', transactionIndex })
      runningBalance = transaction.balanceAfter.minorUnits
    }
  })

  return Object.freeze({ isBalanced: issues.length === 0, issues: Object.freeze(issues) })
}
