export default function MyRecords({ records }) {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">📚 내가 남긴 독서 기록</h2>
      <div className="row">
        {records.length === 0 ? (
          <p className="text-muted">작성된 기록이 없습니다.</p>
        ) : (
          records.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="row g-0">
                  <div className="col-4">
                    {/* item.thumbnail이 저장되어 있어야 여기서 보입니다! */}
                    <img 
                      src={item.thumbnail || "https://via.placeholder.com/150"} 
                      className="img-fluid rounded-start"
                      alt={item.bookTitle}
                      style={{ height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div className="col-8">
                    <div className="card-body ps-2">
                      <h6 className="card-title text-truncate">{item.bookTitle}</h6>
                      <small className="text-muted">{item.date}</small>
                      <p className="card-text mt-2" style={{ fontSize: '0.85rem' }}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}