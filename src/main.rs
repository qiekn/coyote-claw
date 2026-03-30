fn main() {
  println!("Hello, world!");

  // ----------------------------------------------------------------------------: unwrap & expect

  let x: Result<i32, &str> = Err("x error");
  let y: Result<i32, &str> = Ok(5);
  let value = y.unwrap(); // value = 5;

  let _ = x.expect("qiekn expect value:");
  let _ = x.unwrap();

  println!("value: {}", value);
}
