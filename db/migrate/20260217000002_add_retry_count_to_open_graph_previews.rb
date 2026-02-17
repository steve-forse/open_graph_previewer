class AddRetryCountToOpenGraphPreviews < ActiveRecord::Migration[8.1]
  def change
    add_column :open_graph_previews, :retry_count, :integer, default: 0, null: false
  end
end
