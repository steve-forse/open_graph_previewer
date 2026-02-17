class CreateOpenGraphPreviews < ActiveRecord::Migration[8.1]
  def change
    create_table :open_graph_previews do |t|
      t.string :url, null: false
      t.string :status, null: false, default: "pending"
      t.string :og_image_url
      t.json :og_data
      t.string :error_message

      t.timestamps
    end

    add_index :open_graph_previews, :created_at, order: { created_at: :desc }
    add_index :open_graph_previews, :status
  end
end
