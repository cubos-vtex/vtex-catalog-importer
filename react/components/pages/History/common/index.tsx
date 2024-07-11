import type { useModalState } from '@vtex/admin-ui'
import { Skeleton, csx } from '@vtex/admin-ui'
import React from 'react'
import { useMutation } from 'react-apollo'
import type {
  ImportStatus,
  Mutation,
  MutationDeleteImportsArgs,
} from 'ssesandbox04.catalog-importer'

import { DELETE_IMPORTS_MUTATION } from '../../../graphql'

export { DeleteConfirmationModal } from './DeleteConfirmationModal'
export { ImportDetails } from './ImportDetails'
export { ImportResults } from './ImportResults'
export { ShowImportModal } from './ShowImportModal'

export type ImportChangedStatus = Record<string, ImportStatus>

export const useDeleteImport = (
  setDeleted: React.Dispatch<React.SetStateAction<string[]>>,
  openDeleteConfirmationModal: ReturnType<typeof useModalState>
) => {
  const [deleteImports, { loading }] = useMutation<
    Mutation,
    MutationDeleteImportsArgs
  >(DELETE_IMPORTS_MUTATION, {
    onCompleted(data) {
      setDeleted((prev) => [...prev, ...data.deleteImports])
      openDeleteConfirmationModal.hide()
    },
  })

  const deleteImport = (deleteId: string) => {
    deleteImports({ variables: { ids: [deleteId] } })
  }

  return { loading, deleteImport }
}

export const EntitySkeleton = () => <Skeleton className={csx({ height: 20 })} />
